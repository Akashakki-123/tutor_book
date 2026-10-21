import { Request, Response } from "express";
import { badRequest, created, success, unknownError } from "../helpers/response.helper.js";
import { addTeacher, getAllTeachers } from "../helpers/teacher.helper.js";

export async function saveTeacher(req: Request, res: Response): Promise<Response> {
  try {
    const { status, message, data } = await addTeacher(req);
    return status ? created(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error);
  }
}

export async function listTeachers(_req: Request, res: Response): Promise<Response> {
  try {
    const { status, message, data } = await getAllTeachers();
    return status ? success(res, message, data) : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error);
  }
}
