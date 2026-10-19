import { Request } from 'express';
import mongoose, { Types } from 'mongoose';
import {
  addUserSuccessMessage,
  userSessionsSuccessMessage,
} from '../constants/messageConstants.js';
import { returnFormatter, FormatterResult } from '../formatters/common.formatter.js';
import { userDetailsFormatter } from '../formatters/user.formatter.js';
import userModel, { IUser, UserRole } from '../models/user.model.js';
import sessionModel from '../models/session.model.js';
import { encryptPassword } from '../utils/encrypt.js';

/**
 * API 1: Create a new user
 */
export async function addUser(req: Request): Promise<FormatterResult> {
  try {
    const formattedData = userDetailsFormatter(req);

    if (!formattedData.fullName || !formattedData.email || !formattedData.phone || !formattedData.password) {
      return returnFormatter(false, 'All fields (fullName, email, phone, password) are required');
    }

    // Check unique email
    const existingUser = await userModel.findOne({ email: formattedData.email });
    if (existingUser) {
      return returnFormatter(false, 'Email already exists');
    }

    // Hash password
    const hashedPassword = encryptPassword(formattedData.password);

    const role: UserRole = formattedData.role === 'TEACHER' || formattedData.role === 'ADMIN'
      ? formattedData.role
      : 'USER';

    const newUser = await userModel.create({
      fullName: formattedData.fullName,
      email: formattedData.email,
      phone: formattedData.phone,
      password: hashedPassword,
      role,
    });

    // Sanitize user output (remove password)
    const userResponse = newUser.toObject() as Partial<IUser>;
    delete userResponse.password;

    return returnFormatter(true, addUserSuccessMessage, userResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return returnFormatter(false, message);
  }
}

/**
 * API 6: User Session List (Mandatory: MongoDB Aggregation Pipeline)
 * Returns sessions separated into:
 * - Upcoming Sessions (BOOKED)
 * - Completed Sessions (COMPLETED)
 */
export async function getUserSessions(userId: string): Promise<FormatterResult> {
  try {
    if (!mongoose.isValidObjectId(userId)) {
      return returnFormatter(false, 'Invalid user ID format');
    }

    const userObjectId = new Types.ObjectId(userId);

    // Validate user exists
    const userExists = await userModel.findById(userObjectId);
    if (!userExists) {
      return returnFormatter(false, 'User not found');
    }

    // Aggregation pipeline using $facet
    const aggregationResult = await sessionModel.aggregate([
      {
        $match: {
          userId: userObjectId,
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
        $facet: {
          upcomingSessions: [
            {
              $match: {
                status: 'BOOKED',
              },
            },
            {
              $sort: { startTime: 1 },
            },
          ],
          completedSessions: [
            {
              $match: {
                status: 'COMPLETED',
              },
            },
            {
              $sort: { completedAt: -1, startTime: -1 },
            },
          ],
        },
      },
    ]);

    const rawResult = aggregationResult[0];
    const upcoming = rawResult?.upcomingSessions || [];
    const completed = rawResult?.completedSessions || [];

    const sessionsData = {
      upcomingSessions: upcoming,
      completedSessions: completed,
      'Upcoming Sessions': upcoming,
      'Completed Sessions': completed,
    };

    return returnFormatter(true, userSessionsSuccessMessage, sessionsData);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return returnFormatter(false, message);
  }
}

