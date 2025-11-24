// Data layer abstraction - localStorage implementation
// Designed to be easily replaceable with MongoDB

import type { Class, Teacher, Subject, Room, Timetable } from '@/types';

const STORAGE_KEYS = {
  classes: 'timetable_classes',
  teachers: 'timetable_teachers',
  subjects: 'timetable_subjects',
  rooms: 'timetable_rooms',
  timetables: 'timetable_timetables',
} as const;

// Generic storage helper
class StorageService<T extends { id: string }> {
  private key: string;

  constructor(key: string) {
    this.key = key;
  }

  private getAll(): T[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(this.key);
    return data ? JSON.parse(data) : [];
  }

  private saveAll(items: T[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.key, JSON.stringify(items));
  }

  // CRUD operations
  async findAll(): Promise<T[]> {
    return this.getAll();
  }

  async findById(id: string): Promise<T | null> {
    const items = this.getAll();
    return items.find((item) => item.id === id) || null;
  }

  async create(item: Omit<T, 'id'>): Promise<T> {
    const items = this.getAll();
    const newItem = {
      ...item,
      id: crypto.randomUUID(),
    } as T;
    items.push(newItem);
    this.saveAll(items);
    return newItem;
  }

  async update(id: string, updates: Partial<Omit<T, 'id'>>): Promise<T | null> {
    const items = this.getAll();
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return null;
    items[index] = { ...items[index], ...updates };
    this.saveAll(items);
    return items[index];
  }

  async delete(id: string): Promise<boolean> {
    const items = this.getAll();
    const filtered = items.filter((item) => item.id !== id);
    if (filtered.length === items.length) return false;
    this.saveAll(filtered);
    return true;
  }

  async deleteMany(ids: string[]): Promise<number> {
    const items = this.getAll();
    const filtered = items.filter((item) => !ids.includes(item.id));
    const deletedCount = items.length - filtered.length;
    this.saveAll(filtered);
    return deletedCount;
  }

  async clear(): Promise<void> {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.key);
  }
}

// Export storage services for each collection
export const classStorage = new StorageService<Class>(STORAGE_KEYS.classes);
export const teacherStorage = new StorageService<Teacher>(STORAGE_KEYS.teachers);
export const subjectStorage = new StorageService<Subject>(STORAGE_KEYS.subjects);
export const roomStorage = new StorageService<Room>(STORAGE_KEYS.rooms);
export const timetableStorage = new StorageService<Timetable>(STORAGE_KEYS.timetables);

// Export all data (for JSON export)
export async function exportAllData() {
  return {
    classes: await classStorage.findAll(),
    teachers: await teacherStorage.findAll(),
    subjects: await subjectStorage.findAll(),
    rooms: await roomStorage.findAll(),
    timetables: await timetableStorage.findAll(),
  };
}

// Import all data (for JSON import)
export async function importAllData(data: {
  classes?: Class[];
  teachers?: Teacher[];
  subjects?: Subject[];
  rooms?: Room[];
  timetables?: Timetable[];
}) {
  if (data.classes) {
    await classStorage.clear();
    for (const item of data.classes) {
      await classStorage.create(item);
    }
  }
  if (data.teachers) {
    await teacherStorage.clear();
    for (const item of data.teachers) {
      await teacherStorage.create(item);
    }
  }
  if (data.subjects) {
    await subjectStorage.clear();
    for (const item of data.subjects) {
      await subjectStorage.create(item);
    }
  }
  if (data.rooms) {
    await roomStorage.clear();
    for (const item of data.rooms) {
      await roomStorage.create(item);
    }
  }
  if (data.timetables) {
    await timetableStorage.clear();
    for (const item of data.timetables) {
      await timetableStorage.create(item);
    }
  }
}

