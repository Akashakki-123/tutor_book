import { Request, Response } from "express";
import { badRequest, created, success, unknownError } from "../helpers/response.helper.js";
import { addUser, getUserSessions } from "../helpers/user.helper.js";

export async function saveUser(req: Request, res: Response): Promise<Response> {
  try {
    const { status, message, data } = await addUser(req);
    return status ? created(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error);
  }
}

export async function getUserSessionList(req: Request, res: Response): Promise<Response> {
  try {
    const id = req.params.id;
    const userId = Array.isArray(id) ? id[0] : id;
    if (!userId) {
      return badRequest(res, "User ID is required");
    }
    const { status, message, data } = await getUserSessions(userId);
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error);
  }
}
