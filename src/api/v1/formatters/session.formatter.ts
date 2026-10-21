import { Request } from "express";

export interface CreateSessionInput {
  teacherId: string;
  startTime: Date;
  endTime: Date;
}

export function sessionDetailsFormatter(req: Request): CreateSessionInput {
  const { teacherId, startTime, endTime } = req.body;
  return {
    teacherId: typeof teacherId === "string" ? teacherId.trim() : "",
    startTime: new Date(startTime),
    endTime: new Date(endTime),
  };
}
