import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import prisma from '../config/database';
import { AppointmentStatus, QueueStatus } from '@prisma/client';
import { logAudit } from '../utils/audit';

export const getDoctorAppointments = async (req: AuthenticatedRequest, res: Response, next: any) => {
  try {
    let doctorId: string | undefined;

    if (req.user?.role === 'DOCTOR') {
      const docProfile = await prisma.doctorProfile.findUnique({
        where: { userId: req.user.userId as string },
      });
      if (docProfile) doctorId = docProfile.id;
    } else {
      doctorId = req.query.doctorId as string;
    }

    if (!doctorId) {
      return res.status(400).json({ success: false, message: 'Doctor profile not found.' });
    }

    const appointments = await prisma.appointment.findMany({
      where: { doctorId },
      include: {
        patient: {
          include: {
            requirements: { orderBy: { createdAt: 'desc' }, take: 1 },
          },
        },
        department: true,
        queueEntry: true,
        consultation: { include: { prescriptions: true } },
      },
      orderBy: { appointmentDate: 'desc' },
    });

    return res.status(200).json({ success: true, data: appointments });
  } catch (err) {
    next(err);
  }
};

export const getPatientHistory = async (req: AuthenticatedRequest, res: Response, next: any) => {
  try {
    const { id } = req.params; // patientId

    const patient = await prisma.patientProfile.findUnique({
      where: { id },
      include: {
        requirements: { orderBy: { createdAt: 'desc' } },
        appointments: {
          include: {
            doctor: { select: { fullName: true, specialty: true } },
            department: { select: { name: true } },
          },
          orderBy: { appointmentDate: 'desc' },
        },
        consultations: {
          include: {
            doctor: { select: { fullName: true, specialty: true } },
            prescriptions: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient record not found.' });
    }

    return res.status(200).json({ success: true, data: patient });
  } catch (err) {
    next(err);
  }
};

export const createConsultation = async (req: AuthenticatedRequest, res: Response, next: any) => {
  try {
    const { appointmentId, chiefComplaint, diagnosis, prescriptionNotes, followUpDate, doctorNotes, prescriptions } = req.body;

    const appt = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appt) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    const consultation = await prisma.$transaction(async (tx) => {
      const created = await tx.consultation.create({
        data: {
          appointmentId,
          patientId: appt.patientId,
          doctorId: appt.doctorId,
          chiefComplaint,
          diagnosis,
          prescriptionNotes: prescriptionNotes || null,
          followUpDate: followUpDate ? new Date(followUpDate) : null,
          doctorNotes: doctorNotes || null,
        },
      });

      if (prescriptions && Array.isArray(prescriptions)) {
        for (const item of prescriptions) {
          await tx.prescription.create({
            data: {
              consultationId: created.id,
              medicationName: item.medicationName,
              dosage: item.dosage,
              frequency: item.frequency,
              duration: item.duration,
              instructions: item.instructions || null,
            },
          });
        }
      }

      // Mark appointment COMPLETED and QueueEntry COMPLETED
      await tx.appointment.update({
        where: { id: appointmentId },
        data: { status: AppointmentStatus.COMPLETED },
      });

      await tx.queueEntry.updateMany({
        where: { appointmentId },
        data: { status: QueueStatus.COMPLETED, endTime: new Date() },
      });

      return created;
    });

    await logAudit({
      userId: req.user!.userId as string,
      userRole: 'DOCTOR',
      action: 'CREATE_CONSULTATION',
      entity: 'Consultation',
      entityId: consultation.id,
      details: `Created consultation record and diagnosis for appointment ${appt.referenceNumber}`,
    });

    return res.status(201).json({
      success: true,
      message: 'Consultation notes and prescriptions saved successfully.',
      data: consultation,
    });
  } catch (err) {
    next(err);
  }
};

export const getConsultation = async (req: AuthenticatedRequest, res: Response, next: any) => {
  try {
    const { id } = req.params;
    const consultation = await prisma.consultation.findUnique({
      where: { id },
      include: {
        patient: true,
        doctor: true,
        appointment: true,
        prescriptions: true,
      },
    });

    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Consultation record not found.' });
    }

    return res.status(200).json({ success: true, data: consultation });
  } catch (err) {
    next(err);
  }
};

export const updateConsultation = async (req: AuthenticatedRequest, res: Response, next: any) => {
  try {
    const { id } = req.params;
    const { diagnosis, prescriptionNotes, doctorNotes, followUpDate } = req.body;

    const updated = await prisma.consultation.update({
      where: { id },
      data: {
        diagnosis,
        prescriptionNotes,
        doctorNotes,
        followUpDate: followUpDate ? new Date(followUpDate) : undefined,
      },
    });

    return res.status(200).json({ success: true, message: 'Consultation record updated.', data: updated });
  } catch (err) {
    next(err);
  }
};
