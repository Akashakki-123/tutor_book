import { Request, Response, NextFunction, ErrorRequestHandler, RequestHandler } from 'express';
import { unknownError, badRequest } from '../helpers/response.helper.js';
import { InvalidUriMessage } from '../constants/messageConstants.js';

/**
 * Centralized Express error handling middleware
 * Automatically formats:
 * - Express errors
 * - Mongoose ValidationError
 * - Mongoose CastError
 * - MongoDB duplicate key errors (code 11000)
 * - JWT errors (JsonWebTokenError, TokenExpiredError)
 * - Generic server errors
 */
export const errorHandler: ErrorRequestHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  unknownError(res, err);
};

/**
 * Handler for invalid / unmatched route URIs
 */
export const notFoundHandler: RequestHandler = (
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  badRequest(res, InvalidUriMessage);
};

