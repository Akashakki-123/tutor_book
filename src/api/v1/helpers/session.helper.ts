import { Request } from 'express';
import mongoose, { Types } from 'mongoose';
import {
  createSessionSuccessMessage,
  availableSessionsSuccessMessage,
  bookSessionSuccessMessage,
  completeSessionSuccessMessage,
} from '../constants/messageConstants.js';
import { returnFormatter, FormatterResult } from '../formatters/common.formatter.js';
import { sessionDetailsFormatter } from '../formatters/session.formatter.js';
import sessionModel from '../models/session.model.js';
import teacherModel from '../models/teacher.model.js';
import userModel from '../models/user.model.js';

/**
 * API 2: Create a new session for a teacher
 * Rules:
 * - Validate teacher exists
 * - Validate endTime > startTime
 * - Default status: AVAILABLE
 */
export async function addSession(req: Request): Promise<FormatterResult> {
  try {
    const formattedData = sessionDetailsFormatter(req);

    if (!formattedData.teacherId || !req.body.startTime || !req.body.endTime) {
      return returnFormatter(false, 'teacherId, startTime, and endTime are required');
    }

    if (!mongoose.isValidObjectId(formattedData.teacherId)) {
      return returnFormatter(false, 'Invalid teacherId format');
    }

    // Validate teacher exists
    const teacher = await teacherModel.findById(formattedData.teacherId);
    if (!teacher) {
      return returnFormatter(false, 'Teacher does not exist');
    }

    // Validate timestamps
    const startTime = formattedData.startTime;
    const endTime = formattedData.endTime;

    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return returnFormatter(false, 'Invalid date format for startTime or endTime');
    }

    if (endTime <= startTime) {
      return returnFormatter(false, 'endTime must be greater than startTime');
    }

    const newSession = await sessionModel.create({
      teacherId: new Types.ObjectId(formattedData.teacherId),
      userId: null,
      startTime,
      endTime,
      status: 'AVAILABLE',
      completedAt: null,
    });

    return returnFormatter(true, createSessionSuccessMessage, newSession);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return returnFormatter(false, message);
  }
}

/**
 * API 3: Available Sessions for Booking
 * Mandatory: Must be implemented using MongoDB Aggregation Pipeline
 * Query param: dateTimestamp (timestamp in ms, seconds, or date string)
 */
export async function getAvailableSessions(dateTimestampQuery: string | number | undefined): Promise<FormatterResult> {
  try {
    if (!dateTimestampQuery) {
      return returnFormatter(false, 'dateTimestamp query parameter is required');
    }

    // Parse date timestamp (handles milliseconds, seconds, or ISO string)
    let targetDate: Date;
    const numericTimestamp = Number(dateTimestampQuery);

    if (!isNaN(numericTimestamp)) {
      // If timestamp is in seconds (e.g. 10 digits), convert to ms
      targetDate = numericTimestamp < 1e11 ? new Date(numericTimestamp * 1000) : new Date(numericTimestamp);
    } else {
      targetDate = new Date(String(dateTimestampQuery));
    }

    if (isNaN(targetDate.getTime())) {
      return returnFormatter(false, 'Invalid dateTimestamp format');
    }

    // Calculate start and end of that date (UTC)
    const startOfDay = new Date(Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate(), 0, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate(), 23, 59, 59, 999));

    // Mandatory: MongoDB Aggregation Pipeline
    const availableSessions = await sessionModel.aggregate([
      {
        $match: {
          status: 'AVAILABLE',
          startTime: {
            $gte: startOfDay,
            $lte: endOfDay,
          },
        },
      },
      {
        $lookup: {
          from: 'teachers',
          localField: 'teacherId',
          foreignField: '_id',
          as: 'teacher',
        },
      },
      {
        $unwind: {
          path: '$teacher',
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
            _id: '$teacher._id',
            fullName: '$teacher.fullName',
            email: '$teacher.email',
            specialization: '$teacher.specialization',
            experience: '$teacher.experience',
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

/**
 * API 4: Book Session
 * POST /sessions/:id/book
 * Rules:
 * - User must exist
 * - Session must exist
 * - Only AVAILABLE sessions can be booked
 * - A booked session cannot be booked again
 * - Update status to BOOKED and associate with userId
 */
export async function bookSession(sessionId: string, userId: string): Promise<FormatterResult> {
  try {
    if (!sessionId || !mongoose.isValidObjectId(sessionId)) {
      return returnFormatter(false, 'Invalid session ID');
    }

    if (!userId || !mongoose.isValidObjectId(userId)) {
      return returnFormatter(false, 'Valid userId is required to book a session');
    }

    // Rule: User must exist
    const user = await userModel.findById(userId);
    if (!user) {
      return returnFormatter(false, 'User does not exist');
    }

    // Rule: Session must exist
    const session = await sessionModel.findById(sessionId);
    if (!session) {
      return returnFormatter(false, 'Session does not exist');
    }

    // Rule: Only AVAILABLE sessions can be booked & cannot be booked again
    if (session.status !== 'AVAILABLE') {
      return returnFormatter(false, 'Session is not available for booking. It is already booked or completed');
    }

    session.status = 'BOOKED';
    session.userId = new Types.ObjectId(userId);
    await session.save();

    const populatedSession = await sessionModel
      .findById(session._id)
      .populate('teacherId', 'fullName email specialization experience')
      .populate('userId', 'fullName email phone');

    return returnFormatter(true, bookSessionSuccessMessage, populatedSession);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return returnFormatter(false, message);
  }
}

/**
 * API 5: Mark Session Complete
 * PATCH /sessions/:id/complete
 * Rules:
 * - Session must exist
 * - Only BOOKED sessions can be marked as completed
 * - Update status to COMPLETED and set completedAt
 */
export async function markSessionComplete(sessionId: string): Promise<FormatterResult> {
  try {
    if (!sessionId || !mongoose.isValidObjectId(sessionId)) {
      return returnFormatter(false, 'Invalid session ID');
    }

    // Rule: Session must exist
    const session = await sessionModel.findById(sessionId);
    if (!session) {
      return returnFormatter(false, 'Session does not exist');
    }

    // Rule: Only BOOKED sessions can be marked as completed
    if (session.status !== 'BOOKED') {
      return returnFormatter(false, `Cannot complete session. Only BOOKED sessions can be marked as completed (current status: ${session.status})`);
    }

    session.status = 'COMPLETED';
    session.completedAt = new Date();
    await session.save();

    const populatedSession = await sessionModel
      .findById(session._id)
      .populate('teacherId', 'fullName email specialization experience')
      .populate('userId', 'fullName email phone');

    return returnFormatter(true, completeSessionSuccessMessage, populatedSession);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return returnFormatter(false, message);
  }
}

