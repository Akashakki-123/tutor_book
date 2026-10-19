import { Request, Response, NextFunction } from 'express';
import { verifyJwt } from '../utils/jwt.js';
import { unauthorized, forbidden } from '../helpers/response.helper.js';
import {
  TokenMissingMessage,
  InvalidTokenMessage,
  UnauthorizedMessage,
  ForbiddenMessage,
} from '../constants/messageConstants.js';
import { JwtUserPayload } from '../types/index.js';

// Express Request augmentation for req.user
declare global {
  namespace Express {
    interface Request {
      user?: JwtUserPayload;
    }
  }
}

/**
 * Authentication middleware: extracts Bearer JWT, verifies it, and attaches user to req.user
 */
export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      unauthorized(res, TokenMissingMessage);
      return;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      unauthorized(res, 'Invalid authorization format. Format must be "Bearer <token>"');
      return;
    }

    const token = parts[1];
    if (!token) {
      unauthorized(res, TokenMissingMessage);
      return;
    }

    const payload = verifyJwt(token);
    if (!payload) {
      unauthorized(res, InvalidTokenMessage);
      return;
    }

    req.user = payload;
    next();
  } catch {
    unauthorized(res, 'Authentication failed');
  }
}

/**
 * Reusable authorization middleware factory supporting one or more roles
 * Usage examples:
 * authorize("USER")
 * authorize("TEACHER")
 * authorize("ADMIN")
 * authorize("TEACHER", "ADMIN")
 */
export function authorize(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      unauthorized(res, UnauthorizedMessage);
      return;
    }

    if (allowedRoles.length > 0) {
      const userRole = req.user.role;
      if (!userRole || !allowedRoles.includes(userRole)) {
        forbidden(res, ForbiddenMessage);
        return;
      }
    }

    next();
  };
}

