import { Request } from "express";
import mongoose, { Types } from "mongoose";
import {
  createSessionSuccessMessage,
  availableSessionsSuccessMessage,
  bookSessionSuccessMessage,
  completeSessionSuccessMessage,
} from "../constants/messageConstants.js";
import { returnFormatter, FormatterResult } from "../formatters/common.formatter.js";
import { sessionDetailsFormatter } from "../formatters/session.formatter.js";
import sessionModel from "../models/session.model.js";
import teacherModel from "../models/teacher.model.js";
import userModel from "../models/user.model.js";

export async function addSession(req: Request): Promise<FormatterResult> {
  try {
    const formattedData = sessionDetailsFormatter(req);

    if (!formattedData.teacherId || !req.body.startTime || !req.body.endTime) {
      return returnFormatter(false, "Teacher, start time, and end time are required");
    }

    if (!mongoose.isValidObjectId(formattedData.teacherId)) {
      return returnFormatter(false, "Invalid teacher ID");
    }

    const teacher = await teacherModel.findById(formattedData.teacherId);
    if (!teacher) {
      return returnFormatter(false, "Teacher does not exist");
    }

    const startTime = formattedData.startTime;
    const endTime = formattedData.endTime;

    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return returnFormatter(false, "Invalid date format for start time or end time");
    }

    if (endTime <= startTime) {
      return returnFormatter(false, "End time must be greater than start time");
    }

    const newSession = await sessionModel.create({
      teacherId: new Types.ObjectId(formattedData.teacherId),
      userId: null,
      startTime,
      endTime,
      status: "AVAILABLE",
      completedAt: null,
    });

    return returnFormatter(true, createSessionSuccessMessage, newSession);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return returnFormatter(false, message);
  }
}

export async function getAvailableSessions(dateTimestampQuery: string | number | undefined): Promise<FormatterResult> {
  try {
    if (!dateTimestampQuery) {
      return returnFormatter(false, "dateTimestamp parameter is required");
    }

    let targetDate: Date;
    const numericTimestamp = Number(dateTimestampQuery);

    if (!isNaN(numericTimestamp)) {
      targetDate = numericTimestamp < 1e11 ? new Date(numericTimestamp * 1000) : new Date(numericTimestamp);
    } else {
      targetDate = new Date(String(dateTimestampQuery));
    }

    if (isNaN(targetDate.getTime())) {
      return returnFormatter(false, "Invalid date format");
    }

    const startOfDay = new Date(Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate(), 0, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate(), 23, 59, 59, 999));

    const availableSessions = await sessionModel.aggregate([
      {
        $match: {
          status: "AVAILABLE",
          startTime: {
            $gte: startOfDay,
            $lte: endOfDay,
          },
        },
      },
      {
        $lookup: {
          from: "teachers",
          localField: "teacherId",
          foreignField: "_id",
          as: "teacher",
        },
      },
      {
        $unwind: {
          path: "$teacher",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          teacherId: 1,
          userId: 1,
          startTime: 1,
          endTime: 1,
          status: 1,
          completedAt: 1,
          createdAt: 1,
          updatedAt: 1,
          teacher: {
            _id: "$teacher._id",
            fullName: "$teacher.fullName",
            email: "$teacher.email",
            specialization: "$teacher.specialization",
            experience: "$teacher.experience",
          },
        },
      },
      {
        $sort: { startTime: 1 },
      },
    ]);

    return returnFormatter(true, availableSessionsSuccessMessage, availableSessions);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return returnFormatter(false, message);
  }
}

export async function bookSession(sessionId: string, userId: string): Promise<FormatterResult> {
  try {
    if (!sessionId || !mongoose.isValidObjectId(sessionId)) {
      return returnFormatter(false, "Invalid session ID");
    }

    if (!userId || !mongoose.isValidObjectId(userId)) {
      return returnFormatter(false, "Valid user ID is required");
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return returnFormatter(false, "User does not exist");
    }

    const session = await sessionModel.findById(sessionId);
    if (!session) {
      return returnFormatter(false, "Session does not exist");
    }

    if (session.status !== "AVAILABLE") {
      return returnFormatter(false, "Session is already booked");
    }

    session.status = "BOOKED";
    session.userId = new Types.ObjectId(userId);
    await session.save();

    const populatedSession = await sessionModel
      .findById(session._id)
      .populate("teacherId", "fullName email specialization experience")
      .populate("userId", "fullName email phone");

    return returnFormatter(true, bookSessionSuccessMessage, populatedSession);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return returnFormatter(false, message);
  }
}

export async function markSessionComplete(sessionId: string): Promise<FormatterResult> {
  try {
    if (!sessionId || !mongoose.isValidObjectId(sessionId)) {
      return returnFormatter(false, "Invalid session ID");
    }

    const session = await sessionModel.findById(sessionId);
    if (!session) {
      return returnFormatter(false, "Session does not exist");
    }

    if (session.status !== "BOOKED") {
      return returnFormatter(false, "Only booked sessions can be marked as completed");
    }

    session.status = "COMPLETED";
    session.completedAt = new Date();
    await session.save();

    const populatedSession = await sessionModel
      .findById(session._id)
      .populate("teacherId", "fullName email specialization experience")
      .populate("userId", "fullName email phone");

    return returnFormatter(true, completeSessionSuccessMessage, populatedSession);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return returnFormatter(false, message);
  }
}
