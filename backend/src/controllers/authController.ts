import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import * as authService from '../services/authService';
import prisma from '../config/database';

export const register = async (req: AuthenticatedRequest, res: Response, next: any) => {
  try {
    const result = await authService.registerUser(req.body);
    return res.status(201).json({
      success: true,
      message: 'User account registered successfully.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req: AuthenticatedRequest, res: Response, next: any) => {
  try {
    const result = await authService.loginUser(req.body);
    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req: AuthenticatedRequest, res: Response) => {
  res.clearCookie('token');
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};

export const getMe = async (req: AuthenticatedRequest, res: Response, next: any) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthenticated.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId as string },
      select: {
        id: true,
        email: true,
        role: true,
        patientProfile: true,
        doctorProfile: {
          include: { department: true },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User record not found.' });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
};
