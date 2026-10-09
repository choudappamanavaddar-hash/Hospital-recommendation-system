import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import prisma from '../config/database';

export const getProfile = async (req: AuthenticatedRequest, res: Response, next: any) => {
  try {
    const profile = await prisma.patientProfile.findUnique({
      where: { userId: req.user!.userId as string },
      include: { user: { select: { email: true, role: true } } },
    });

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Patient profile not found.' });
    }

    return res.status(200).json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response, next: any) => {
  try {
    const existing = await prisma.patientProfile.findUnique({
      where: { userId: req.user!.userId as string },
    });

    let updated;
    if (existing) {
      updated = await prisma.patientProfile.update({
        where: { userId: req.user!.userId as string },
        data: {
          fullName: req.body.fullName,
          phone: req.body.phone,
          dateOfBirth: req.body.dateOfBirth ? new Date(req.body.dateOfBirth) : undefined,
          gender: req.body.gender,
          address: req.body.address,
          emergencyContact: req.body.emergencyContact,
          medicalHistory: req.body.medicalHistory,
          allergies: req.body.allergies,
          currentMedications: req.body.currentMedications,
        },
      });
    } else {
      updated = await prisma.patientProfile.create({
        data: {
          userId: req.user!.userId as string,
          fullName: req.body.fullName || 'Patient',
          phone: req.body.phone,
          dateOfBirth: req.body.dateOfBirth ? new Date(req.body.dateOfBirth) : undefined,
          gender: req.body.gender,
          address: req.body.address,
          emergencyContact: req.body.emergencyContact,
          medicalHistory: req.body.medicalHistory,
          allergies: req.body.allergies,
          currentMedications: req.body.currentMedications,
        },
      });
    }

    return res.status(200).json({ success: true, message: 'Profile updated successfully.', data: updated });
  } catch (err) {
    next(err);
  }
};

export const getAppointments = async (req: AuthenticatedRequest, res: Response, next: any) => {
  try {
    const patientProfile = await prisma.patientProfile.findUnique({
      where: { userId: req.user!.userId as string },
    });

    if (!patientProfile) {
      return res.status(200).json({ success: true, data: [] });
    }

    const appointments = await prisma.appointment.findMany({
      where: { patientId: patientProfile.id },
      include: {
        doctor: { select: { fullName: true, specialty: true } },
        department: { select: { name: true, code: true } },
        queueEntry: true,
      },
      orderBy: { appointmentDate: 'desc' },
    });

    return res.status(200).json({ success: true, data: appointments });
  } catch (err) {
    next(err);
  }
};

export const getVisits = async (req: AuthenticatedRequest, res: Response, next: any) => {
  try {
    const patientProfile = await prisma.patientProfile.findUnique({
      where: { userId: req.user!.userId as string },
    });

    if (!patientProfile) {
      return res.status(200).json({ success: true, data: [] });
    }

    const visits = await prisma.consultation.findMany({
      where: { patientId: patientProfile.id },
      include: {
        doctor: { select: { fullName: true, specialty: true } },
        appointment: { select: { referenceNumber: true, appointmentDate: true, timeSlot: true } },
        prescriptions: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ success: true, data: visits });
  } catch (err) {
    next(err);
  }
};
