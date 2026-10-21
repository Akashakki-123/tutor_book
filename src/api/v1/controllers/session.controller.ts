import { Request, Response } from "express";
import { badRequest, created, success, unknownError } from "../helpers/response.helper.js";
import {
  addSession,
  getAvailableSessions,
  bookSession,
  markSessionComplete,
} from "../helpers/session.helper.js";

export async function saveSession(req: Request, res: Response): Promise<Response> {
  try {
    const { status, message, data } = await addSession(req);
    return status ? created(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error);
  }
}

export async function getAvailableSessionsList(req: Request, res: Response): Promise<Response> {
  try {
    const rawTimestamp = req.query.dateTimestamp;
    const dateTimestamp = Array.isArray(rawTimestamp)
      ? String(rawTimestamp[0])
      : rawTimestamp !== undefined
      ? String(rawTimestamp)
      : undefined;
    const { status, message, data } = await getAvailableSessions(dateTimestamp);
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error);
  }
}

export async function bookUserSession(req: Request, res: Response): Promise<Response> {
  try {
    const id = req.params.id;
    const sessionId = Array.isArray(id) ? id[0] : id;
    const userId = req.body.userId || (req.user ? req.user.id : undefined);

    if (!sessionId) {
      return badRequest(res, "Session ID is required");
    }

    if (!userId) {
      return badRequest(res, "userId is required");
    }

    const { status, message, data } = await bookSession(sessionId, String(userId));
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error);
  }
}

export async function completeSession(req: Request, res: Response): Promise<Response> {
  try {
    const id = req.params.id;
    const sessionId = Array.isArray(id) ? id[0] : id;
    if (!sessionId) {
      return badRequest(res, "Session ID is required");
    }

    const { status, message, data } = await markSessionComplete(sessionId);
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error);
  }
}
