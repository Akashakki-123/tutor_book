import { model, Schema, Document } from 'mongoose';

export interface ITeacher extends Document {
  fullName: string;
  email: string;
  specialization: string;
  experience: number;
  createdAt: Date;
  updatedAt: Date;
}

const teacherSchema = new Schema<ITeacher>(
  {
    fullName: {
      type: String,
      required: [true, 'Teacher full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Teacher email is required'],
      lowercase: true,
      trim: true,
    },
    specialization: {
      type: String,
      required: [true, 'Specialization is required'],
      trim: true,
    },
    experience: {
      type: Number,
      required: [true, 'Years of experience is required'],
      min: [0, 'Experience cannot be negative'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const teacherModel = model<ITeacher>('Teacher', teacherSchema);
export default teacherModel;

