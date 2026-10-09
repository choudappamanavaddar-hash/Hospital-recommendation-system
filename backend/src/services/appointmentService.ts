import prisma from '../config/database';
import { AppointmentStatus, QueueStatus } from '@prisma/client';
import { logAudit } from '../utils/audit';

export interface CreateAppointmentInput {
  patientId: string;
  doctorId: string;
  departmentId: string;
  appointmentDate: string; // ISO date or YYYY-MM-DD
  timeSlot: string;
  notes?: string;
}

export const createAppointment = async (input: CreateAppointmentInput, userId: string) => {
  const dateObj = new Date(input.appointmentDate);

  // Check double booking for doctor at same date/timeSlot
  const existingDocBooking = await prisma.appointment.findFirst({
    where: {
      doctorId: input.doctorId,
      appointmentDate: dateObj,
      timeSlot: input.timeSlot,
      status: { in: ['BOOKED', 'CHECKED_IN', 'IN_CONSULTATION'] },
    },
  });

  if (existingDocBooking) {
    throw {
      statusCode: 409,
      message: `The selected doctor is already booked for ${input.timeSlot} on ${dateObj.toISOString().split('T')[0]}. Please select another time slot.`,
    };
  }

  // Generate unique reference number
  const referenceNumber = 'APP-' + Math.floor(100000 + Math.random() * 900000);

  // Create inside transaction
  const result = await prisma.$transaction(async (tx) => {
    const appt = await tx.appointment.create({
      data: {
        referenceNumber,
        patientId: input.patientId,
        doctorId: input.doctorId,
        departmentId: input.departmentId,
        appointmentDate: dateObj,
        timeSlot: input.timeSlot,
        notes: input.notes || null,
        status: AppointmentStatus.BOOKED,
      },
      include: {
        doctor: { select: { fullName: true, specialty: true } },
        department: { select: { name: true } },
        patient: { select: { fullName: true } },
      },
    });

    return appt;
  });

  await logAudit({
    userId,
    userRole: 'PATIENT',
    action: 'BOOK_APPOINTMENT',
    entity: 'Appointment',
    entityId: result.id,
    details: `Booked appointment ${result.referenceNumber} with ${result.doctor.fullName} for ${input.timeSlot}`,
  });

  return result;
};

export const cancelAppointment = async (appointmentId: string, userId: string, userRole: string) => {
  const appt = await prisma.appointment.findUnique({ where: { id: appointmentId } });
  if (!appt) {
    throw { statusCode: 404, message: 'Appointment not found.' };
  }

  const updated = await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: AppointmentStatus.CANCELLED },
  });

  // If there was a queue entry, mark it skipped
  await prisma.queueEntry.updateMany({
    where: { appointmentId },
    data: { status: QueueStatus.SKIPPED },
  });

  await logAudit({
    userId,
    userRole,
    action: 'CANCEL_APPOINTMENT',
    entity: 'Appointment',
    entityId: appointmentId,
    details: `Cancelled appointment ${appt.referenceNumber}`,
  });

  return updated;
};
