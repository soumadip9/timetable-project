import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Room from '@/models/Room';
import mongoose from 'mongoose';

export async function GET() {
  try {
    await connectDB();
    const rooms = await Room.find().lean();
    return NextResponse.json({ success: true, data: rooms }, { status: 200 });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rooms', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { name, capacity, building } = body;

    if (!name || capacity === undefined || !building) {
      return NextResponse.json(
        { error: 'Missing required fields', required: ['name', 'capacity', 'building'] },
        { status: 400 }
      );
    }

    const newRoom = new Room({ name, capacity, building });
    const saved = await newRoom.save();

    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (error) {
    console.error('Error creating room:', error);
    if (error instanceof mongoose.Error.ValidationError) {
      const errors = Object.values(error.errors).map((err) => err.message);
      return NextResponse.json({ error: 'Validation error', details: errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Failed to create room', message: error instanceof Error ? error.message : 'Unknown error' },
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

    const updated = await Room.findByIdAndUpdate(id, update, { new: true, runValidators: true });

    if (!updated) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (error) {
    console.error('Error updating room:', error);
    return NextResponse.json(
      { error: 'Failed to update room', message: error instanceof Error ? error.message : 'Unknown error' },
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

    const deleted = await Room.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Cascade delete timetables
    const TimetableNew = (await import('@/models/TimetableNew')).default;
    await TimetableNew.deleteMany({ roomId: id });

    return NextResponse.json({ success: true, data: deleted }, { status: 200 });
  } catch (error) {
    console.error('Error deleting room:', error);
    return NextResponse.json(
      { error: 'Failed to delete room', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

