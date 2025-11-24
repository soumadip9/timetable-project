// TypeScript types for all collections

export interface Class {
  id: string;
  name: string;
  section: string;
  grade: string;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  specialization: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  building: string;
}

export interface Timetable {
  id: string;
  classId: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  timeSlot: string; // Format: "HH:MM-HH:MM" e.g., "09:00-10:30"
  subjectId: string;
  teacherId: string;
  roomId: string;
}

// Helper type for timetable with populated references
export interface TimetableWithDetails extends Omit<Timetable, 'classId' | 'subjectId' | 'teacherId' | 'roomId'> {
  class: Class;
  subject: Subject;
  teacher: Teacher;
  room: Room;
}

