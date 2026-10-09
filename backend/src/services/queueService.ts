import prisma from '../config/database';
import { QueueStatus, AppointmentStatus } from '@prisma/client';
import { logAudit } from '../utils/audit';

export const checkInPatient = async (appointmentId: string, userId: string) => {
  const appt = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { doctor: true, department: true },
  });

  if (!appt) {
    throw { statusCode: 404, message: 'Appointment not found.' };
  }

  if (appt.status === AppointmentStatus.CANCELLED) {
    throw { statusCode: 400, message: 'Cannot check in for a cancelled appointment.' };
  }

  // Check if queue entry already exists
  const existingQueue = await prisma.queueEntry.findUnique({ where: { appointmentId } });
  if (existingQueue) {
    return existingQueue;
  }

  // Calculate next queue number for doctor today
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const countToday = await prisma.queueEntry.count({
    where: {
      doctorId: appt.doctorId,
      createdAt: { gte: todayStart },
    },
  });

  const queueNumber = countToday + 101; // Start numbers at 101

  // Waiting position among currently waiting patients
  const waitingAhead = await prisma.queueEntry.count({
    where: {
      doctorId: appt.doctorId,
      status: QueueStatus.WAITING,
      createdAt: { gte: todayStart },
    },
  });

  const position = waitingAhead + 1;
  const estimatedWaitMins = position * 15;

  const queueEntry = await prisma.$transaction(async (tx) => {
    // Update appointment status to CHECKED_IN
    await tx.appointment.update({
      where: { id: appointmentId },
      data: { status: AppointmentStatus.CHECKED_IN },
    });

    return await tx.queueEntry.create({
      data: {
        appointmentId,
        doctorId: appt.doctorId,
        departmentId: appt.departmentId,
        queueNumber,
        position,
        estimatedWaitMins,
        status: QueueStatus.WAITING,
      },
    });
  });

  await logAudit({
    userId,
    userRole: 'PATIENT',
    action: 'CHECK_IN',
    entity: 'QueueEntry',
    entityId: queueEntry.id,
    details: `Checked in for appointment ${appt.referenceNumber}, assigned Queue #${queueNumber}`,
  });

  return queueEntry;
};

export const getQueueStatusForAppointment = async (appointmentId: string) => {
  const queueEntry = await prisma.queueEntry.findUnique({
    where: { appointmentId },
    include: {
      appointment: {
        include: {
          doctor: { select: { fullName: true, specialty: true } },
          department: { select: { name: true } },
        },
      },
    },
  });

  if (!queueEntry) {
    return null;
  }

  // Calculate current dynamic position (how many WAITING entries ahead with earlier queue number)
  const patientsAhead = await prisma.queueEntry.count({
    where: {
      doctorId: queueEntry.doctorId,
      status: QueueStatus.WAITING,
      queueNumber: { lt: queueEntry.queueNumber },
    },
  });

  return {
    ...queueEntry,
    patientsAhead,
    dynamicPosition: patientsAhead + 1,
    estimatedWaitMins: (patientsAhead + 1) * 15,
  };
};

export const callNextPatientInQueue = async (doctorId: string, adminOrDoctorUserId: string) => {
  // Find next waiting patient
  const nextInLine = await prisma.queueEntry.findFirst({
    where: {
      doctorId,
      status: QueueStatus.WAITING,
    },
    orderBy: { queueNumber: 'asc' },
    include: { appointment: true },
  });

  if (!nextInLine) {
    return null;
  }

  // Update status to IN_PROGRESS and appointment to IN_CONSULTATION
  const updated = await prisma.$transaction(async (tx) => {
    await tx.appointment.update({
      where: { id: nextInLine.appointmentId },
      data: { status: AppointmentStatus.IN_CONSULTATION },
    });

    return await tx.queueEntry.update({
      where: { id: nextInLine.id },
      data: {
        status: QueueStatus.IN_PROGRESS,
        startTime: new Date(),
      },
      include: {
        appointment: {
          include: { patient: true },
        },
      },
    });
  });

  await logAudit({
    userId: adminOrDoctorUserId,
    userRole: 'DOCTOR',
    action: 'CALL_NEXT_PATIENT',
    entity: 'QueueEntry',
    entityId: updated.id,
    details: `Called Queue #${updated.queueNumber} into consultation room`,
  });

  return updated;
};
