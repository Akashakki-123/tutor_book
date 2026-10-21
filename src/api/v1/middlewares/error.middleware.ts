import { Request, Response, NextFunction, ErrorRequestHandler, RequestHandler } from "express";
import { unknownError, badRequest } from "../helpers/response.helper.js";
import { invalidUriMessage } from "../constants/messageConstants.js";

export const errorHandler: ErrorRequestHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  unknownError(res, err);
};

export const notFoundHandler: RequestHandler = (
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  badRequest(res, invalidUriMessage);
};
