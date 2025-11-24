'use client';

import type {
  Id,
  ClassDoc,
  TeacherDoc,
  SubjectDoc,
  RoomDoc,
  TimetableDoc,
  Collections,
} from '@/types/models';

const STORAGE_KEY = 'timetable-db-v1';

const emptyDb: Collections = {
  classes: [],
  teachers: [],
  subjects: [],
  rooms: [],
  timetables: [],
};

function loadDb(): Collections {
  if (typeof window === 'undefined') {
    return emptyDb;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return emptyDb;
    }
    return JSON.parse(stored) as Collections;
  } catch (error) {
    console.error('Error loading database:', error);
    return emptyDb;
  }
}

function saveDb(db: Collections): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (error) {
    console.error('Error saving database:', error);
  }
}

export function exportDb(): string {
  const db = loadDb();
  return JSON.stringify(db, null, 2);
}

export function resetDb(): void {
  saveDb(emptyDb);
}

export function generateId(): Id {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

// Database operations object
export const db = {
  getAll(): Collections {
    return loadDb();
  },

  // Class operations
  addClass(data: Omit<ClassDoc, 'id'>): Collections {
    const db = loadDb();
    const newClass: ClassDoc = {
      ...data,
      id: generateId(),
    };
    db.classes.push(newClass);
    saveDb(db);
    return db;
  },

  updateClass(id: Id, update: Partial<ClassDoc>): Collections {
    const db = loadDb();
    const index = db.classes.findIndex((c) => c.id === id);
    if (index !== -1) {
      db.classes[index] = { ...db.classes[index], ...update };
      saveDb(db);
    }
    return db;
  },

  deleteClass(id: Id): Collections {
    const db = loadDb();
    db.classes = db.classes.filter((c) => c.id !== id);
    // Cascade delete: remove timetables with this classId
    db.timetables = db.timetables.filter((t) => t.classId !== id);
    saveDb(db);
    return db;
  },

  // Teacher operations
  addTeacher(data: Omit<TeacherDoc, 'id'>): Collections {
    const db = loadDb();
    const newTeacher: TeacherDoc = {
      ...data,
      id: generateId(),
    };
    db.teachers.push(newTeacher);
    saveDb(db);
    return db;
  },

  updateTeacher(id: Id, update: Partial<TeacherDoc>): Collections {
    const db = loadDb();
    const index = db.teachers.findIndex((t) => t.id === id);
    if (index !== -1) {
      db.teachers[index] = { ...db.teachers[index], ...update };
      saveDb(db);
    }
    return db;
  },

  deleteTeacher(id: Id): Collections {
    const db = loadDb();
    db.teachers = db.teachers.filter((t) => t.id !== id);
    // Cascade delete: remove timetables with this teacherId
    db.timetables = db.timetables.filter((t) => t.teacherId !== id);
    saveDb(db);
    return db;
  },

  // Subject operations
  addSubject(data: Omit<SubjectDoc, 'id'>): Collections {
    const db = loadDb();
    const newSubject: SubjectDoc = {
      ...data,
      id: generateId(),
    };
    db.subjects.push(newSubject);
    saveDb(db);
    return db;
  },

  updateSubject(id: Id, update: Partial<SubjectDoc>): Collections {
    const db = loadDb();
    const index = db.subjects.findIndex((s) => s.id === id);
    if (index !== -1) {
      db.subjects[index] = { ...db.subjects[index], ...update };
      saveDb(db);
    }
    return db;
  },

  deleteSubject(id: Id): Collections {
    const db = loadDb();
    db.subjects = db.subjects.filter((s) => s.id !== id);
    // Cascade delete: remove timetables with this subjectId
    db.timetables = db.timetables.filter((t) => t.subjectId !== id);
    saveDb(db);
    return db;
  },

  // Room operations
  addRoom(data: Omit<RoomDoc, 'id'>): Collections {
    const db = loadDb();
    const newRoom: RoomDoc = {
      ...data,
      id: generateId(),
    };
    db.rooms.push(newRoom);
    saveDb(db);
    return db;
  },

  updateRoom(id: Id, update: Partial<RoomDoc>): Collections {
    const db = loadDb();
    const index = db.rooms.findIndex((r) => r.id === id);
    if (index !== -1) {
      db.rooms[index] = { ...db.rooms[index], ...update };
      saveDb(db);
    }
    return db;
  },

  deleteRoom(id: Id): Collections {
    const db = loadDb();
    db.rooms = db.rooms.filter((r) => r.id !== id);
    // Cascade delete: remove timetables with this roomId
    db.timetables = db.timetables.filter((t) => t.roomId !== id);
    saveDb(db);
    return db;
  },

  // Timetable operations
  upsertTimetableEntry(data: Omit<TimetableDoc, 'id'>): Collections {
    const db = loadDb();
    // Find existing entry with same (classId, day, timeSlot)
    const existingIndex = db.timetables.findIndex(
      (t) =>
        t.classId === data.classId &&
        t.day === data.day &&
        t.timeSlot === data.timeSlot
    );

    if (existingIndex !== -1) {
      // Update existing entry
      db.timetables[existingIndex] = {
        ...db.timetables[existingIndex],
        ...data,
      };
    } else {
      // Add new entry
      const newEntry: TimetableDoc = {
        ...data,
        id: generateId(),
      };
      db.timetables.push(newEntry);
    }
    saveDb(db);
    return db;
  },

  deleteTimetableEntry(id: Id): Collections {
    const db = loadDb();
    db.timetables = db.timetables.filter((t) => t.id !== id);
    saveDb(db);
    return db;
  },
};

