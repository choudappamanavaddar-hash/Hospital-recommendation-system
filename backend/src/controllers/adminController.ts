import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import prisma from '../config/database';
import bcrypt from 'bcryptjs';
import { logAudit } from '../utils/audit';

export const getDashboardStats = async (req: AuthenticatedRequest, res: Response, next: any) => {
  try {
    const totalPatients = await prisma.patientProfile.count();
    const totalDoctors = await prisma.doctorProfile.count({ where: { active: true } });
    const totalDepartments = await prisma.department.count({ where: { active: true } });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayAppointments = await prisma.appointment.count({
      where: { createdAt: { gte: todayStart } },
    });

    const waitingPatients = await prisma.queueEntry.count({
      where: { status: 'WAITING' },
    });

    const completedAppointments = await prisma.appointment.count({
      where: { status: 'COMPLETED' },
    });

    const cancelledAppointments = await prisma.appointment.count({
      where: { status: 'CANCELLED' },
    });

    const recentAppointments = await prisma.appointment.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        patient: { select: { fullName: true } },
        doctor: { select: { fullName: true, specialty: true } },
        department: { select: { name: true } },
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          totalPatients,
          totalDoctors,
          totalDepartments,
          todayAppointments,
          waitingPatients,
          completedAppointments,
          cancelledAppointments,
        },
        recentAppointments,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const createDepartment = async (req: AuthenticatedRequest, res: Response, next: any) => {
  try {
    const { name, code, description, services, roomNumber, icon } = req.body;
    const department = await prisma.department.create({
      data: { name, code, description, services, roomNumber, icon },
    });

    await logAudit({
      userId: req.user!.userId as string,
      userRole: 'ADMIN',
      action: 'CREATE_DEPARTMENT',
      entity: 'Department',
      entityId: department.id,
      details: `Created department ${name} (${code})`,
    });

    return res.status(201).json({ success: true, message: 'Department created successfully.', data: department });
  } catch (err) {
    next(err);
  }
};

export const updateDepartment = async (req: AuthenticatedRequest, res: Response, next: any) => {
  try {
    const { id } = req.params;
    const department = await prisma.department.update({
      where: { id },
      data: req.body,
    });

    return res.status(200).json({ success: true, message: 'Department updated.', data: department });
  } catch (err) {
    next(err);
  }
};

export const createDoctor = async (req: AuthenticatedRequest, res: Response, next: any) => {
  try {
    const { email, password, fullName, phone, specialty, departmentId, bio, qualification, availableDays, slotDurationMins } = req.body;

    const passwordHash = await bcrypt.hash(password || 'Password123!', 10);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { email, passwordHash, role: 'DOCTOR' },
      });

      const doctor = await tx.doctorProfile.create({
        data: {
          userId: user.id,
          fullName,
          phone,
          specialty,
          departmentId,
          bio,
          qualification,
          availableDays: availableDays || 'Monday,Tuesday,Wednesday,Thursday,Friday',
          slotDurationMins: slotDurationMins || 30,
        },
      });

      return doctor;
    });

    await logAudit({
      userId: req.user!.userId as string,
      userRole: 'ADMIN',
      action: 'CREATE_DOCTOR',
      entity: 'DoctorProfile',
      entityId: result.id,
      details: `Created doctor profile for ${fullName}`,
    });

    return res.status(201).json({ success: true, message: 'Doctor profile created successfully.', data: result });
  } catch (err) {
    next(err);
  }
};

export const updateDoctor = async (req: AuthenticatedRequest, res: Response, next: any) => {
  try {
    const { id } = req.params;
    const updated = await prisma.doctorProfile.update({
      where: { id },
      data: req.body,
    });

    return res.status(200).json({ success: true, message: 'Doctor profile updated.', data: updated });
  } catch (err) {
    next(err);
  }
};

export const createSchedule = async (req: AuthenticatedRequest, res: Response, next: any) => {
  try {
    const { doctorId, dayOfWeek, startTime, endTime, isAvailable } = req.body;

    const schedule = await prisma.doctorSchedule.upsert({
      where: { doctorId_dayOfWeek: { doctorId, dayOfWeek } },
      update: { startTime, endTime, isAvailable },
      create: { doctorId, dayOfWeek, startTime, endTime, isAvailable: isAvailable ?? true },
    });

    return res.status(200).json({ success: true, message: 'Doctor schedule updated.', data: schedule });
  } catch (err) {
    next(err);
  }
};

export const updateSchedule = async (req: AuthenticatedRequest, res: Response, next: any) => {
  try {
    const { id } = req.params;
    const updated = await prisma.doctorSchedule.update({
      where: { id },
      data: req.body,
    });

    return res.status(200).json({ success: true, message: 'Schedule updated.', data: updated });
  } catch (err) {
    next(err);
  }
};

export const getReports = async (req: AuthenticatedRequest, res: Response, next: any) => {
  try {
    const departmentDistribution = await prisma.appointment.groupBy({
      by: ['departmentId'],
      _count: { id: true },
    });

    const statusDistribution = await prisma.appointment.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    const auditLogs = await prisma.auditLog.findMany({
      take: 25,
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      success: true,
      data: {
        departmentDistribution,
        statusDistribution,
        auditLogs,
      },
    });
  } catch (err) {
    next(err);
  }
};
