import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Subject from '@/models/Subject';
import mongoose from 'mongoose';

export async function GET() {
  try {
    await connectDB();
    const subjects = await Subject.find().lean();
    // Convert _id to id
    const transformed = subjects.map((s: any) => ({
      id: s._id.toString(),
      name: s.name,
      code: s.code,
    }));
    return NextResponse.json({ success: true, data: transformed }, { status: 200 });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subjects', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { name, code } = body;

    if (!name || !code) {
      return NextResponse.json(
        { error: 'Missing required fields', required: ['name', 'code'] },
        { status: 400 }
      );
    }

    const newSubject = new Subject({ name, code });
    const saved = await newSubject.save();

    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (error) {
    console.error('Error creating subject:', error);
    if (error instanceof mongoose.Error.ValidationError) {
      const errors = Object.values(error.errors).map((err) => err.message);
      return NextResponse.json({ error: 'Validation error', details: errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Failed to create subject', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { id, ...update } = body;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid or missing id' }, { status: 400 });
    }

    const updated = await Subject.findByIdAndUpdate(id, update, { new: true, runValidators: true });

    if (!updated) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (error) {
    console.error('Error updating subject:', error);
    return NextResponse.json(
      { error: 'Failed to update subject', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid or missing id' }, { status: 400 });
    }

    const deleted = await Subject.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    }

    // Cascade delete timetables
    const TimetableNew = (await import('@/models/TimetableNew')).default;
    await TimetableNew.deleteMany({ subjectId: id });

    return NextResponse.json({ success: true, data: deleted }, { status: 200 });
  } catch (error) {
    console.error('Error deleting subject:', error);
    return NextResponse.json(
      { error: 'Failed to delete subject', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

