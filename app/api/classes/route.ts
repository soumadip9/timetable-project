import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Class from '@/models/Class';
import mongoose from 'mongoose';

export async function GET() {
  try {
    await connectDB();
    const classes = await Class.find().lean();
    // Convert _id to id
    const transformed = classes.map((c: any) => ({
      id: c._id.toString(),
      name: c.name,
      section: c.section,
      grade: c.grade,
    }));
    return NextResponse.json({ success: true, data: transformed }, { status: 200 });
  } catch (error) {
    console.error('Error fetching classes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch classes', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { name, section, grade } = body;

    if (!name || !section || grade === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields', required: ['name', 'section', 'grade'] },
        { status: 400 }
      );
    }

    const newClass = new Class({ name, section, grade });
    const saved = await newClass.save();

    return NextResponse.json({
      success: true,
      data: {
        id: saved._id.toString(),
        name: saved.name,
        section: saved.section,
        grade: saved.grade,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating class:', error);
    if (error instanceof mongoose.Error.ValidationError) {
      const errors = Object.values(error.errors).map((err) => err.message);
      return NextResponse.json({ error: 'Validation error', details: errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Failed to create class', message: error instanceof Error ? error.message : 'Unknown error' },
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

    const updated = await Class.findByIdAndUpdate(id, update, { new: true, runValidators: true });

    if (!updated) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updated._id.toString(),
        name: updated.name,
        section: updated.section,
        grade: updated.grade,
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating class:', error);
    return NextResponse.json(
      { error: 'Failed to update class', message: error instanceof Error ? error.message : 'Unknown error' },
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

    const deleted = await Class.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    // Cascade delete timetables
    const TimetableNew = (await import('@/models/TimetableNew')).default;
    await TimetableNew.deleteMany({ classId: id });

    return NextResponse.json({
      success: true,
      data: {
        id: deleted._id.toString(),
        name: deleted.name,
        section: deleted.section,
        grade: deleted.grade,
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Error deleting class:', error);
    return NextResponse.json(
      { error: 'Failed to delete class', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

