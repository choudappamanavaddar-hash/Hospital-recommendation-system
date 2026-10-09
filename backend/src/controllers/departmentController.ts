import { Request, Response } from 'express';
import prisma from '../config/database';

export const getDepartments = async (req: Request, res: Response, next: any) => {
  try {
    const departments = await prisma.department.findMany({
      where: { active: true },
      include: {
        doctors: {
          where: { active: true },
          select: { id: true, fullName: true, specialty: true, qualification: true, availableDays: true },
        },
      },
    });

    return res.status(200).json({ success: true, data: departments });
  } catch (err) {
    next(err);
  }
};

export const getDepartmentById = async (req: Request, res: Response, next: any) => {
  try {
    const { id } = req.params;
    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        doctors: {
          where: { active: true },
          include: { user: { select: { email: true } } },
        },
      },
    });

    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found.' });
    }

    return res.status(200).json({ success: true, data: department });
  } catch (err) {
    next(err);
  }
};
