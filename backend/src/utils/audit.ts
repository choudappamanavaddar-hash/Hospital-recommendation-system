import prisma from '../config/database';
import { logger } from './logger';

export interface AuditParams {
  userId?: string;
  userRole?: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: string;
  ipAddress?: string;
}

export const logAudit = async (params: AuditParams) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId || null,
        userRole: params.userRole || null,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId || null,
        details: params.details || null,
        ipAddress: params.ipAddress || null,
      },
    });
  } catch (err: any) {
    logger.error('Failed to save audit log entry', err);
  }
};
