import { Response } from 'express';
import mongoose from 'mongoose';
import { ApiResponse } from '../types/index.js';

/**
 * Standard unified response sender
 */
export function sendResponse<T = unknown>(
  res: Response,
  statusCode: number,
  status: boolean,
  message: string,
  error: unknown = '',
  items?: T
): Response {
  const response: ApiResponse<T> = {
    status,
    subCode: statusCode,
    message,
    error: error ?? '',
    items: items ?? ({} as T),
  };

  const extendedRes = res as unknown as { tokenInfo?: unknown };
  if (extendedRes.tokenInfo) {
    response.tokenInfo = extendedRes.tokenInfo;
  }

  return res.status(statusCode).json(response);
}

/**
 * Send 200 OK success response
 */
export function success<T = unknown>(res: Response, message: string = 'Success', items?: T): Response {
  return sendResponse(res, 200, true, message, '', items);
}

/**
 * Send 201 Created response
 */
export function created<T = unknown>(res: Response, message: string = 'Created', items?: T): Response {
  return sendResponse(res, 201, true, message, '', items);
}

/**
 * Send 404 Not Found response
 */
export function notFound(res: Response, message: string = 'Not Found'): Response {
  return sendResponse(res, 404, false, message, '', {});
}

/**
 * Send 400 Bad Request response
 */
export function badRequest(res: Response, message: string = 'Bad Request', error: unknown = ''): Response {
  return sendResponse(res, 400, false, message, error, undefined);
}

/**
 * Send 401 Unauthorized response
 */
export function unauthorized(res: Response, message: string = 'Unauthorized', error: unknown = ''): Response {
  return sendResponse(res, 401, false, message, error, {});
}

/**
 * Send 403 Forbidden response
 */
export function forbidden(res: Response, message: string = 'Forbidden', error: unknown = ''): Response {
  return sendResponse(res, 403, false, message, error, {});
}

/**
 * Send 301/Invalid response (from original helper)
 */
export function invalid<T = unknown>(res: Response, message: string = 'Invalid Request', items?: T): Response {
  return sendResponse(res, 301, false, message, '', items);
}

/**
 * Send generic onError response
 */
export function onError(res: Response, message: string = 'Error', error: unknown = null): Response {
  return sendResponse(res, 400, false, message, error, null);
}

/**
 * Format Mongoose validation error string/errors
 */
export function validation(rawMessage: string): Record<string, string> {
  const errors: Record<string, string> = {};
  const colonIndex = rawMessage.indexOf(':');
  const allErrors = colonIndex !== -1 ? rawMessage.substring(colonIndex + 1).trim() : rawMessage.trim();
  const allErrorArray = allErrors.split(',').map((err) => err.trim());

  allErrorArray.forEach((error) => {
    const parts = error.split(':').map((err) => err.trim());
    if (parts.length >= 2) {
      const [key, value] = parts;
      if (key && value) {
        errors[key.toUpperCase().replace('.', '-')] = value.toUpperCase().replace('.', '-');
      }
    }
  });

  return errors;
}

/**
 * Format duplicate key error (MongoDB code 11000)
 */
export function alreadyExist(keyValueObj: Record<string, unknown>): Record<string, string> {
  const errors: Record<string, string> = {};
  const keys = Object.keys(keyValueObj);
  keys.forEach((key) => {
    const formattedKey = key.toUpperCase().replace('.', '-');
    errors[formattedKey] = `${formattedKey} ALREADY EXIST`;
  });
  return errors;
}

/**
 * Send server validation errors (express-validator compatibility)
 */
export function serverValidation(
  res: Response,
  error: { errors: Array<{ param: string; msg: string }> }
): Response {
  const responseErrors: Record<string, string> = {};
  error.errors.forEach((err) => {
    const key = err.param.toUpperCase().replace('.', '-');
    const value = err.msg.toUpperCase().replace('.', '-');
    responseErrors[key] = value;
  });
  return sendResponse(res, 400, false, 'Server Validation Errors', 'ValidationError', responseErrors);
}

/**
 * Centralized unknown error classifier and responder
 */
export function unknownError(res: Response, error: unknown): Response {
  if (error instanceof mongoose.Error.ValidationError) {
    const formattedErrors: Record<string, string> = {};
    for (const [key, val] of Object.entries(error.errors)) {
      formattedErrors[key.toUpperCase().replace('.', '-')] = (val.message || 'Required').toUpperCase().replace('.', '-');
    }
    return sendResponse(res, 400, false, 'All Fields Required', 'ValidationError', formattedErrors);
  }

  if (error instanceof mongoose.Error.CastError) {
    const valueType = (error as unknown as { valueType?: string }).valueType || typeof error.value;
    return sendResponse(res, 400, false, 'Invalid Data', 'CastError', {
      data: `Need ${error.kind} but getting ${valueType}`,
    });
  }

  const errObject = error as { name?: string; code?: number; keyValue?: Record<string, unknown>; message?: string; statusCode?: number };

  // MongoDB duplicate key error (code 11000)
  if (errObject?.code === 11000 && errObject.keyValue) {
    const formattedError = alreadyExist(errObject.keyValue);
    return sendResponse(res, 400, false, 'Unique Data Required', 'UniqueDataRequired', formattedError);
  }

  // JWT Errors
  if (errObject?.name === 'JsonWebTokenError') {
    return sendResponse(res, 401, false, 'Invalid Token', 'JsonWebTokenError', errObject.message || 'Invalid token signature');
  }

  if (errObject?.name === 'TokenExpiredError') {
    return sendResponse(res, 401, false, 'Token Expired', 'TokenExpiredError', errObject.message || 'Token has expired');
  }

  // Custom status code if provided (e.g. from HttpError or custom error)
  if (typeof errObject?.statusCode === 'number' && errObject.statusCode >= 400 && errObject.statusCode < 600) {
    return sendResponse(res, errObject.statusCode, false, errObject.message || 'Request Failed', errObject.name || 'HttpError', {});
  }

  if (error instanceof Error) {
    return sendResponse(res, 500, false, error.message || 'Something Went Wrong', error.name, undefined);
  }

  return sendResponse(res, 500, false, 'Something Went Wrong', 'InternalServerError', undefined);
}
