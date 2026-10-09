import { Request, Response } from 'express';
import { generateDepartmentRecommendations } from '../services/recommendationService';
import prisma from '../config/database';

export const createRecommendation = async (req: Request, res: Response, next: any) => {
  try {
    const { requirementId, visitReason, symptoms, existingConditions, preferredDepartmentId, preferredDoctorId } = req.body;

    let input = {
      visitReason: visitReason || '',
      symptoms: symptoms || '',
      existingConditions: existingConditions || '',
      preferredDepartmentId,
      preferredDoctorId,
    };

    if (requirementId) {
      const reqRecord = await prisma.patientRequirement.findUnique({ where: { id: requirementId } });
      if (reqRecord) {
        input = {
          visitReason: reqRecord.visitReason,
          symptoms: reqRecord.symptoms,
          existingConditions: reqRecord.existingConditions || '',
          preferredDepartmentId: reqRecord.preferredDepartmentId || undefined,
          preferredDoctorId: reqRecord.preferredDoctorId || undefined,
        };
      }
    }

    const recommendations = await generateDepartmentRecommendations(input);

    // Save recommendations if requirementId provided
    if (requirementId) {
      for (const rec of recommendations) {
        await prisma.recommendation.create({
          data: {
            requirementId,
            departmentId: rec.departmentId,
            matchScore: rec.matchScore,
            matchReason: rec.matchReason,
          },
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: recommendations,
    });
  } catch (err) {
    next(err);
  }
};

export const getRecommendation = async (req: Request, res: Response, next: any) => {
  try {
    const { id } = req.params;
    const recommendation = await prisma.recommendation.findUnique({
      where: { id },
      include: {
        department: {
          include: { doctors: true },
        },
        requirement: true,
      },
    });

    if (!recommendation) {
      return res.status(404).json({ success: false, message: 'Recommendation record not found.' });
    }

    return res.status(200).json({ success: true, data: recommendation });
  } catch (err) {
    next(err);
  }
};
