import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import * as appointmentService from '../services/appointmentService';
import * as queueService from '../services/queueService';
import prisma from '../config/database';

export const createAppointment = async (req: AuthenticatedRequest, res: Response, next: any) => {
  try {
    let patientId = req.body.patientId;

    if (!patientId && req.user?.role === 'PATIENT') {
      const patientProfile = await prisma.patientProfile.findUnique({
        where: { userId: req.user.userId as string },
      });
      if (!patientProfile) {
        return res.status(400).json({ success: false, message: 'Patient profile not found. Please complete profile first.' });
      }
      patientId = patientProfile.id;
    }

    const appointment = await appointmentService.createAppointment(
      {
        patientId,
        doctorId: req.body.doctorId,
        departmentId: req.body.departmentId,
        appointmentDate: req.body.appointmentDate,
        timeSlot: req.body.timeSlot,
        notes: req.body.notes,
      },
      req.user!.userId as string
    );

    return res.status(201).json({
      success: true,
      message: 'Appointment successfully booked!',
      data: appointment,
    });
  } catch (err) {
    next(err);
  }
};

export const getAppointmentById = async (req: AuthenticatedRequest, res: Response, next: any) => {
  try {
    const { id } = req.params;
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: true,
        doctor: { include: { department: true } },
        department: true,
        queueEntry: true,
        consultation: { include: { prescriptions: true } },
      },
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    return res.status(200).json({ success: true, data: appointment });
  } catch (err) {
    next(err);
  }
};

export const getAppointments = async (req: AuthenticatedRequest, res: Response, next: any) => {
  try {
    const { doctorId, patientId, status, date } = req.query;

    const whereClause: any = {};

    if (doctorId) whereClause.doctorId = String(doctorId);
    if (patientId) whereClause.patientId = String(patientId);
    if (status) whereClause.status = String(status);
    if (date) whereClause.appointmentDate = new Date(String(date));

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        patient: true,
        doctor: { select: { fullName: true, specialty: true } },
        department: { select: { name: true } },
        queueEntry: true,
      },
      orderBy: { appointmentDate: 'desc' },
    });

    return res.status(200).json({ success: true, data: appointments });
  } catch (err) {
    next(err);
  }
};

export const cancelAppointment = async (req: AuthenticatedRequest, res: Response, next: any) => {
  try {
    const { id } = req.params;
    const result = await appointmentService.cancelAppointment(
      id,
      req.user!.userId as string,
      req.user!.role as string
    );

    return res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const checkInAppointment = async (req: AuthenticatedRequest, res: Response, next: any) => {
  try {
    const { id } = req.params;
    const queueEntry = await queueService.checkInPatient(id, req.user!.userId as string);

    return res.status(200).json({
      success: true,
      message: 'Patient checked in successfully. Assigned to waiting queue.',
      data: queueEntry,
    });
  } catch (err) {
    next(err);
  }
};
