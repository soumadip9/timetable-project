import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITimetableNew extends Document {
  classId: mongoose.Types.ObjectId;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  timeSlot: string;
  subjectId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  roomId: mongoose.Types.ObjectId;
}

const TimetableNewSchema: Schema = new Schema(
  {
    classId: {
      type: Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      required: true,
    },
    timeSlot: {
      type: String,
      required: true,
    },
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true,
    },
    roomId: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure unique entries per class/day/timeSlot
TimetableNewSchema.index({ classId: 1, day: 1, timeSlot: 1 }, { unique: true });

const TimetableNew: Model<ITimetableNew> =
  mongoose.models.TimetableNew || mongoose.model<ITimetableNew>('TimetableNew', TimetableNewSchema);

export default TimetableNew;

