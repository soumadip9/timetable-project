import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITeacher extends Document {
  name: string;
  email: string;
  specialization: string;
}

const TeacherSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    specialization: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Teacher: Model<ITeacher> =
  mongoose.models.Teacher || mongoose.model<ITeacher>('Teacher', TeacherSchema);

export default Teacher;

