import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IClass extends Document {
  name: string;
  section: string;
  grade: number;
}

const ClassSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    section: {
      type: String,
      required: true,
    },
    grade: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Class: Model<IClass> =
  mongoose.models.Class || mongoose.model<IClass>('Class', ClassSchema);

export default Class;

