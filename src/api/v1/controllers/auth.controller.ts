import { Request, Response } from "express";
import { badRequest, success, unknownError } from "../helpers/response.helper.js";
import { loginUser } from "../helpers/auth.helper.js";

export async function login(req: Request, res: Response): Promise<Response> {
  try {
    const { status, message, data } = await loginUser(req);
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error);
  }
}
