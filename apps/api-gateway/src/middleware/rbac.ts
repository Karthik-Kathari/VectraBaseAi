/**
 * VectraBase AI — Role-Based Access Control Middleware
 * Author: Karthik Kathari
 */

import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';

/**
 * Factory: returns Express middleware that enforces role-based access.
 * Usage: router.get('/admin', authenticate, requireRole('WORKSPACE_OWNER'), handler)
 */
export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Access denied. Required role(s): ${roles.join(', ')}. Your role: ${req.user.role}`,
        },
      });
      return;
    }

    next();
  };
}
