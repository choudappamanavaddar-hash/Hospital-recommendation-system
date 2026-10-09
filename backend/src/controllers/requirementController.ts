import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import prisma from '../config/database';

export const createRequirement = async (req: AuthenticatedRequest, res: Response, next: any) => {
  try {
    let patientProfile = await prisma.patientProfile.findUnique({
      where: { userId: req.user!.userId as string },
    });

    if (!patientProfile) {
      patientProfile = await prisma.patientProfile.create({
        data: {
          userId: req.user!.userId as string,
          fullName: req.body.fullName || 'Patient',
          phone: req.body.phone,
        },
      });
    }

    const referenceNumber = 'REQ-' + Math.floor(100000 + Math.random() * 900000);

    const requirement = await prisma.patientRequirement.create({
      data: {
        referenceNumber,
        patientId: patientProfile.id,
        visitReason: req.body.visitReason,
        symptoms: req.body.symptoms,
        onsetDate: req.body.onsetDate ? new Date(req.body.onsetDate) : null,
        durationDays: req.body.durationDays || null,
        previousVisit: Boolean(req.body.previousVisit),
        existingConditions: req.body.existingConditions || null,
        allergies: req.body.allergies || null,
        medications: req.body.medications || null,
        doctorConsultedBefore: Boolean(req.body.doctorConsultedBefore),
        preferredDepartmentId: req.body.preferredDepartmentId || null,
        preferredDoctorId: req.body.preferredDoctorId || null,
        preferredBranch: req.body.preferredBranch || 'Main City Hospital',
        preferredDate: req.body.preferredDate ? new Date(req.body.preferredDate) : null,
        preferredTimeSlot: req.body.preferredTimeSlot || null,
        isNewPatient: Boolean(req.body.isNewPatient ?? true),
        additionalNotes: req.body.additionalNotes || null,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Healthcare requirements submitted successfully.',
      data: requirement,
    });
  } catch (err) {
    next(err);
  }
};

export const getRequirement = async (req: AuthenticatedRequest, res: Response, next: any) => {
  try {
    const { id } = req.params;
    const requirement = await prisma.patientRequirement.findUnique({
      where: { id },
      include: {
        patient: true,
        preferredDepartment: true,
        preferredDoctor: true,
        recommendations: { include: { department: true } },
      },
    });

    if (!requirement) {
      return res.status(404).json({ success: false, message: 'Requirement record not found.' });
    }

    return res.status(200).json({ success: true, data: requirement });
  } catch (err) {
    next(err);
  }
};
