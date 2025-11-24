import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import TimetableNew from '@/models/TimetableNew';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const searchParams = request.nextUrl.searchParams;
    const classId = searchParams.get('classId');
    const day = searchParams.get('day');

    const query: any = {};
    if (classId) {
      if (!mongoose.Types.ObjectId.isValid(classId)) {
        return NextResponse.json({ error: 'Invalid classId format' }, { status: 400 });
      }
      query.classId = new mongoose.Types.ObjectId(classId);
    }
    if (day) {
      query.day = day;
    }

    const timetables = await TimetableNew.find(query)
      .populate('classId', 'name section grade')
      .populate('subjectId', 'name code')
      .populate('teacherId', 'name email specialization')
      .populate('roomId', 'name capacity building')
      .lean();

    return NextResponse.json({ success: true, data: timetables }, { status: 200 });
  } catch (error) {
    console.error('Error fetching timetables:', error);
    return NextResponse.json(
      { error: 'Failed to fetch timetables', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { classId, day, timeSlot, subjectId, teacherId, roomId } = body;

    if (!classId || !day || !timeSlot || !subjectId || !teacherId || !roomId) {
      return NextResponse.json(
        { error: 'Missing required fields', required: ['classId', 'day', 'timeSlot', 'subjectId', 'teacherId', 'roomId'] },
        { status: 400 }
      );
    }

    // Validate ObjectIds
    const ids = { classId, subjectId, teacherId, roomId };
    for (const [key, value] of Object.entries(ids)) {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return NextResponse.json({ error: `Invalid ${key} format` }, { status: 400 });
      }
    }

    // Upsert: find existing entry with same classId, day, timeSlot and update, or create new
    const existing = await TimetableNew.findOne({
      classId: new mongoose.Types.ObjectId(classId),
      day,
      timeSlot,
    });

    let saved;
    if (existing) {
      existing.subjectId = new mongoose.Types.ObjectId(subjectId);
      existing.teacherId = new mongoose.Types.ObjectId(teacherId);
      existing.roomId = new mongoose.Types.ObjectId(roomId);
      saved = await existing.save();
    } else {
      const newTimetable = new TimetableNew({
        classId: new mongoose.Types.ObjectId(classId),
        day,
        timeSlot,
        subjectId: new mongoose.Types.ObjectId(subjectId),
        teacherId: new mongoose.Types.ObjectId(teacherId),
        roomId: new mongoose.Types.ObjectId(roomId),
      });
      saved = await newTimetable.save();
    }

    await saved.populate('classId', 'name section grade');
    await saved.populate('subjectId', 'name code');
    await saved.populate('teacherId', 'name email specialization');
    await saved.populate('roomId', 'name capacity building');

    return NextResponse.json({ success: true, data: saved }, { status: existing ? 200 : 201 });
  } catch (error) {
    console.error('Error creating/updating timetable:', error);
    if (error instanceof mongoose.Error.ValidationError) {
      const errors = Object.values(error.errors).map((err) => err.message);
      return NextResponse.json({ error: 'Validation error', details: errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Failed to create/update timetable', message: error instanceof Error ? error.message : 'Unknown error' },
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

    // Convert ObjectId strings to ObjectIds if present
    if (update.classId) update.classId = new mongoose.Types.ObjectId(update.classId);
    if (update.subjectId) update.subjectId = new mongoose.Types.ObjectId(update.subjectId);
    if (update.teacherId) update.teacherId = new mongoose.Types.ObjectId(update.teacherId);
    if (update.roomId) update.roomId = new mongoose.Types.ObjectId(update.roomId);

    const updated = await TimetableNew.findByIdAndUpdate(id, update, { new: true, runValidators: true });

    if (!updated) {
      return NextResponse.json({ error: 'Timetable not found' }, { status: 404 });
    }

    await updated.populate('classId', 'name section grade');
    await updated.populate('subjectId', 'name code');
    await updated.populate('teacherId', 'name email specialization');
    await updated.populate('roomId', 'name capacity building');

    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (error) {
    console.error('Error updating timetable:', error);
    return NextResponse.json(
      { error: 'Failed to update timetable', message: error instanceof Error ? error.message : 'Unknown error' },
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

    const deleted = await TimetableNew.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Timetable not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: deleted }, { status: 200 });
  } catch (error) {
    console.error('Error deleting timetable:', error);
    return NextResponse.json(
      { error: 'Failed to delete timetable', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

