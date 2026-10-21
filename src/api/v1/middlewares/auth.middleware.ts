import { Request, Response, NextFunction } from "express";
import { verifyJwt } from "../utils/jwt.js";
import { unauthorized, forbidden } from "../helpers/response.helper.js";
import {
  tokenMissingMessage,
  invalidTokenMessage,
  unauthorizedMessage,
  forbiddenMessage,
} from "../constants/messageConstants.js";
import { JwtUserPayload } from "../types/index.js";

declare global {
  namespace Express {
    interface Request {
      user?: JwtUserPayload;
    }
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      unauthorized(res, tokenMissingMessage);
      return;
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      unauthorized(res, "Invalid token format, expected Bearer token");
      return;
    }

    const token = parts[1];
    if (!token) {
      unauthorized(res, tokenMissingMessage);
      return;
    }

    const payload = verifyJwt(token);
    if (!payload) {
      unauthorized(res, invalidTokenMessage);
      return;
    }

    req.user = payload;
    next();
  } catch {
    unauthorized(res, "Authentication failed");
  }
}

export function authorize(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      unauthorized(res, unauthorizedMessage);
      return;
    }

    if (allowedRoles.length > 0) {
      const userRole = req.user.role;
      if (!userRole || !allowedRoles.includes(userRole)) {
        forbidden(res, forbiddenMessage);
        return;
      }
    }

    next();
  };
}
