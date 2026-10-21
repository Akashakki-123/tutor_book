import { Response } from "express";
import mongoose from "mongoose";
import { ApiResponse } from "../types/index.js";

export function sendResponse<T = unknown>(
  res: Response,
  statusCode: number,
  status: boolean,
  message: string,
  error: unknown = "",
  items?: T
): Response {
  const response: ApiResponse<T> = {
    status,
    subCode: statusCode,
    message,
    error: error ?? "",
    items: items ?? ({} as T),
  };

  const extendedRes = res as unknown as { tokenInfo?: unknown };
  if (extendedRes.tokenInfo) {
    response.tokenInfo = extendedRes.tokenInfo;
  }

  return res.status(statusCode).json(response);
}

export function success<T = unknown>(res: Response, message: string = "Success", items?: T): Response {
  return sendResponse(res, 200, true, message, "", items);
}

export function created<T = unknown>(res: Response, message: string = "Created", items?: T): Response {
  return sendResponse(res, 201, true, message, "", items);
}

export function notFound(res: Response, message: string = "Not found"): Response {
  return sendResponse(res, 404, false, message, "", {});
}

export function badRequest(res: Response, message: string = "Bad request", error: unknown = ""): Response {
  return sendResponse(res, 400, false, message, error, undefined);
}

export function unauthorized(res: Response, message: string = "Unauthorized", error: unknown = ""): Response {
  return sendResponse(res, 401, false, message, error, {});
}

export function forbidden(res: Response, message: string = "Forbidden", error: unknown = ""): Response {
  return sendResponse(res, 403, false, message, error, {});
}

export function invalid<T = unknown>(res: Response, message: string = "Invalid request", items?: T): Response {
  return sendResponse(res, 301, false, message, "", items);
}

export function onError(res: Response, message: string = "Error", error: unknown = null): Response {
  return sendResponse(res, 400, false, message, error, null);
}

export function validation(rawMessage: string): Record<string, string> {
  const errors: Record<string, string> = {};
  const colonIndex = rawMessage.indexOf(":");
  const allErrors = colonIndex !== -1 ? rawMessage.substring(colonIndex + 1).trim() : rawMessage.trim();
  const allErrorArray = allErrors.split(",").map((err) => err.trim());

  allErrorArray.forEach((error) => {
    const parts = error.split(":").map((err) => err.trim());
    if (parts.length >= 2) {
      const [key, value] = parts;
      if (key && value) {
        errors[key] = value;
      }
    }
  });

  return errors;
}

export function alreadyExist(keyValueObj: Record<string, unknown>): Record<string, string> {
  const errors: Record<string, string> = {};
  const keys = Object.keys(keyValueObj);
  keys.forEach((key) => {
    errors[key] = `${key} already exists`;
  });
  return errors;
}

export function serverValidation(
  res: Response,
  error: { errors: Array<{ param: string; msg: string }> }
): Response {
  const responseErrors: Record<string, string> = {};
  error.errors.forEach((err) => {
    responseErrors[err.param] = err.msg;
  });
  return sendResponse(res, 400, false, "Validation failed", "ValidationError", responseErrors);
}

export function unknownError(res: Response, error: unknown): Response {
  if (error instanceof mongoose.Error.ValidationError) {
    const formattedErrors: Record<string, string> = {};
    for (const [key, val] of Object.entries(error.errors)) {
      formattedErrors[key] = val.message || "Field is required";
    }
    return sendResponse(res, 400, false, "All fields are required", "ValidationError", formattedErrors);
  }

  if (error instanceof mongoose.Error.CastError) {
    const valueType = (error as unknown as { valueType?: string }).valueType || typeof error.value;
    return sendResponse(res, 400, false, "Invalid data format", "CastError", {
      data: `Expected ${error.kind} but received ${valueType}`,
    });
  }

  const errObject = error as { name?: string; code?: number; keyValue?: Record<string, unknown>; message?: string; statusCode?: number };

  if (errObject?.code === 11000 && errObject.keyValue) {
    const formattedError = alreadyExist(errObject.keyValue);
    return sendResponse(res, 400, false, "Duplicate entry found", "DuplicateKeyError", formattedError);
  }

  if (errObject?.name === "JsonWebTokenError") {
    return sendResponse(res, 401, false, "Invalid token", "JsonWebTokenError", errObject.message || "Invalid signature");
  }

  if (errObject?.name === "TokenExpiredError") {
    return sendResponse(res, 401, false, "Token has expired", "TokenExpiredError", errObject.message || "Token expired");
  }

  if (typeof errObject?.statusCode === "number" && errObject.statusCode >= 400 && errObject.statusCode < 600) {
    return sendResponse(res, errObject.statusCode, false, errObject.message || "Request failed", errObject.name || "HttpError", {});
  }

  if (error instanceof Error) {
    return sendResponse(res, 500, false, error.message || "Something went wrong", error.name, undefined);
  }

  return sendResponse(res, 500, false, "Something went wrong", "InternalServerError", undefined);
}
