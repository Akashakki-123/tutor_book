import { model, Schema, Document } from 'mongoose';

export type UserRole = 'USER' | 'TEACHER' | 'ADMIN';

export interface IUser extends Document {
  fullName: string;
  email: string;
  phone: string;
  password?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false, // Hidden by default in queries and JSON responses
    },
    role: {
      type: String,
      enum: ['USER', 'TEACHER', 'ADMIN'],
      default: 'USER',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const userModel = model<IUser>('User', userSchema);
export default userModel;

