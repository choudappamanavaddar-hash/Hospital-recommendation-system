import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import * as queueService from '../services/queueService';
import prisma from '../config/database';

export const getAppointmentQueue = async (req: AuthenticatedRequest, res: Response, next: any) => {
  try {
    const { id } = req.params; // appointmentId
    const status = await queueService.getQueueStatusForAppointment(id);

    if (!status) {
      return res.status(404).json({ success: false, message: 'Queue record not found for this appointment. Patient may need to check in.' });
    }

    return res.status(200).json({ success: true, data: status });
  } catch (err) {
    next(err);
  }
};

export const getCurrentQueue = async (req: AuthenticatedRequest, res: Response, next: any) => {
  try {
    const { doctorId, departmentId } = req.query;

    const whereClause: any = { status: { in: ['WAITING', 'IN_PROGRESS'] } };
    if (doctorId) whereClause.doctorId = String(doctorId);
    if (departmentId) whereClause.departmentId = String(departmentId);

    const queueEntries = await prisma.queueEntry.findMany({
      where: whereClause,
      include: {
        appointment: {
          include: {
            patient: true,
            doctor: { select: { fullName: true, specialty: true } },
            department: { select: { name: true } },
          },
        },
      },
      orderBy: { queueNumber: 'asc' },
    });

    return res.status(200).json({ success: true, data: queueEntries });
  } catch (err) {
    next(err);
  }
};

export const getQueueById = async (req: AuthenticatedRequest, res: Response, next: any) => {
  try {
    const { id } = req.params;
    const queueEntry = await prisma.queueEntry.findUnique({
      where: { id },
      include: {
        appointment: {
          include: { patient: true, doctor: true, department: true },
        },
      },
    });

    if (!queueEntry) {
      return res.status(404).json({ success: false, message: 'Queue entry not found.' });
    }

    return res.status(200).json({ success: true, data: queueEntry });
  } catch (err) {
    next(err);
  }
};

export const callNext = async (req: AuthenticatedRequest, res: Response, next: any) => {
  try {
    const { doctorId } = req.body;
    let docId = doctorId;

    if (!docId && req.user?.role === 'DOCTOR') {
      const docProfile = await prisma.doctorProfile.findUnique({
        where: { userId: req.user.userId as string },
      });
      if (docProfile) docId = docProfile.id;
    }

    if (!docId) {
      return res.status(400).json({ success: false, message: 'Doctor ID is required to call next patient.' });
    }

    const nextPatient = await queueService.callNextPatientInQueue(docId, req.user!.userId as string);

    if (!nextPatient) {
      return res.status(200).json({ success: true, message: 'No waiting patients in queue.', data: null });
    }

    return res.status(200).json({
      success: true,
      message: `Called Queue #${nextPatient.queueNumber} (${nextPatient.appointment.patient.fullName}) into room.`,
      data: nextPatient,
    });
  } catch (err) {
    next(err);
  }
};
