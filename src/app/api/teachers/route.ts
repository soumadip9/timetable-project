import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Teacher from "@/models/Teacher";

type TeacherDTO = {
  id: string;
  name: string;
  email: string;
  specialization: string;
};

function mapTeacher(doc: any): TeacherDTO {
  return {
    id: doc._id.toString(),
    name: doc.name,
    email: doc.email,
    specialization: doc.specialization,
  };
}

export async function GET() {
  try {
    await connectDB();
    const docs = await Teacher.find().lean();
    const teachers = docs.map(mapTeacher);
    return NextResponse.json({ teachers });
  } catch (err: any) {
    console.error("GET /api/teachers error:", err);
    return NextResponse.json(
      { error: err.message ?? "Failed to fetch teachers" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    console.log("📥 POST /api/teachers body:", body);

    const { name, email, specialization } = body;

    if (!name || !email || !specialization) {
      return NextResponse.json(
        { error: "name, email, and specialization are required" },
        { status: 400 }
      );
    }

    await Teacher.create({ name, email, specialization });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/teachers error:", err);
    return NextResponse.json(
      { error: err.message ?? "Failed to create teacher" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    console.log("📥 PUT /api/teachers body:", body);

    const { id, name, email, specialization } = body;

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    await Teacher.findByIdAndUpdate(
      id,
      { name, email, specialization },
      { new: true }
    );

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("PUT /api/teachers error:", err);
    return NextResponse.json(
      { error: err.message ?? "Failed to update teacher" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    console.log("📥 DELETE /api/teachers body:", body);

    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    await Teacher.findByIdAndDelete(id);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("DELETE /api/teachers error:", err);
    return NextResponse.json(
      { error: err.message ?? "Failed to delete teacher" },
      { status: 500 }
    );
  }
}
