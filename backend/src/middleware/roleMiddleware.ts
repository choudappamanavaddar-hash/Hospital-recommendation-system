import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware';

export const authorizeRoles = (...allowedRoles: Array<'PATIENT' | 'DOCTOR' | 'ADMIN'>) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthenticated user.' });
    }

    if (!allowedRoles.includes(req.user.role as any)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Role '${req.user.role}' is not authorized for this resource.`,
      });
    }

    next();
  };
};
