import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { signToken } from '../config/jwt';
import { logAudit } from '../utils/audit';

export const registerUser = async (data: {
  email: string;
  password: string;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
  fullName: string;
  phone?: string;
}) => {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw { statusCode: 400, message: 'User with this email already exists.' };
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      role: data.role,
    },
  });

  if (data.role === 'PATIENT') {
    await prisma.patientProfile.create({
      data: {
        userId: user.id,
        fullName: data.fullName,
        phone: data.phone || null,
      },
    });
  }

  const token = signToken({ userId: user.id, role: user.role, email: user.email });

  await logAudit({
    userId: user.id,
    userRole: user.role,
    action: 'REGISTER',
    entity: 'User',
    entityId: user.id,
    details: `Registered new account with role ${user.role}`,
  });

  return { user: { id: user.id, email: user.email, role: user.role, fullName: data.fullName }, token };
};

export const loginUser = async (data: { email: string; password: string }) => {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
    include: {
      patientProfile: true,
      doctorProfile: true,
    },
  });

  if (!user) {
    throw { statusCode: 401, message: 'Invalid email or password credentials.' };
  }

  const isMatch = await bcrypt.compare(data.password, user.passwordHash);
  if (!isMatch) {
    throw { statusCode: 401, message: 'Invalid email or password credentials.' };
  }

  const fullName = user.patientProfile?.fullName || user.doctorProfile?.fullName || 'Administrator';
  const token = signToken({ userId: user.id, role: user.role, email: user.email });

  await logAudit({
    userId: user.id,
    userRole: user.role,
    action: 'LOGIN',
    entity: 'User',
    entityId: user.id,
    details: 'User logged in successfully',
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName,
      patientProfileId: user.patientProfile?.id,
      doctorProfileId: user.doctorProfile?.id,
    },
    token,
  };
};
