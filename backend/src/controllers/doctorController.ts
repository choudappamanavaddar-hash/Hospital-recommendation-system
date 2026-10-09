import { Request, Response } from 'express';
import prisma from '../config/database';

export const getDoctors = async (req: Request, res: Response, next: any) => {
  try {
    const { departmentId, specialty, search } = req.query;

    const whereClause: any = { active: true };

    if (departmentId) {
      whereClause.departmentId = String(departmentId);
    }

    if (specialty) {
      whereClause.specialty = { contains: String(specialty), mode: 'insensitive' };
    }

    if (search) {
      whereClause.OR = [
        { fullName: { contains: String(search), mode: 'insensitive' } },
        { specialty: { contains: String(search), mode: 'insensitive' } },
        { bio: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    const doctors = await prisma.doctorProfile.findMany({
      where: whereClause,
      include: {
        department: { select: { id: true, name: true, code: true } },
        schedules: true,
      },
    });

    return res.status(200).json({ success: true, data: doctors });
  } catch (err) {
    next(err);
  }
};

export const getDoctorById = async (req: Request, res: Response, next: any) => {
  try {
    const { id } = req.params;
    const doctor = await prisma.doctorProfile.findUnique({
      where: { id },
      include: {
        department: true,
        schedules: true,
      },
    });

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found.' });
    }

    return res.status(200).json({ success: true, data: doctor });
  } catch (err) {
    next(err);
  }
};

export const getDoctorAvailability = async (req: Request, res: Response, next: any) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    const targetDate = date ? new Date(String(date)) : new Date();

    const doctor = await prisma.doctorProfile.findUnique({
      where: { id },
      include: { schedules: true },
    });

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    // Standard available slots
    const allSlots = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM'];

    // Find booked slots for this doctor on targetDate
    const existingBookings = await prisma.appointment.findMany({
      where: {
        doctorId: id,
        appointmentDate: targetDate,
        status: { in: ['BOOKED', 'CHECKED_IN', 'IN_CONSULTATION'] },
      },
      select: { timeSlot: true },
    });

    const bookedSlots = existingBookings.map((b) => b.timeSlot);
    const availableSlots = allSlots.filter((slot) => !bookedSlots.includes(slot));

    return res.status(200).json({
      success: true,
      data: {
        doctorId: id,
        date: targetDate.toISOString().split('T')[0],
        allSlots,
        bookedSlots,
        availableSlots,
      },
    });
  } catch (err) {
    next(err);
  }
};
