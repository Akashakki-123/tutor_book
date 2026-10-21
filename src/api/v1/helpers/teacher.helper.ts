import { Request } from "express";
import { addTeacherSuccessMessage, teacherSuccessMessage } from "../constants/messageConstants.js";
import { returnFormatter, FormatterResult } from "../formatters/common.formatter.js";
import teacherModel from "../models/teacher.model.js";

export async function addTeacher(req: Request): Promise<FormatterResult> {
  try {
    const { fullName, email, specialization, experience } = req.body;

    if (!fullName || !email || !specialization || experience === undefined) {
      return returnFormatter(false, "Full name, email, specialization and experience are required");
    }

    const newTeacher = await teacherModel.create({
      fullName: String(fullName).trim(),
      email: String(email).toLowerCase().trim(),
      specialization: String(specialization).trim(),
      experience: Number(experience),
    });

    return returnFormatter(true, addTeacherSuccessMessage, newTeacher);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return returnFormatter(false, message);
  }
}

export async function getAllTeachers(): Promise<FormatterResult> {
  try {
    const teachers = await teacherModel.find().sort({ createdAt: -1 });
    return returnFormatter(true, teacherSuccessMessage, teachers);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return returnFormatter(false, message);
  }
}
