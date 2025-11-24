'use client';

import React, { useState, useEffect } from 'react';
import type {
  Collections,
  DayOfWeek,
  TimeSlot,
  ClassDoc,
  TeacherDoc,
  SubjectDoc,
  RoomDoc,
  TimetableDoc,
  Id,
} from '@/types/models';
// Removed localStorage - using API calls instead

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_SLOTS: TimeSlot[] = [
  '09:00-10:00',
  '10:00-11:00',
  '11:00-12:00',
  '12:00-13:00',
  '13:00-14:00',
  '14:00-15:00',
  '15:00-16:00',
  '16:00-17:00',
];

type Tab = 'Timetable' | 'Classes' | 'Teachers' | 'Subjects' | 'Rooms';

export default function TimetableManagementSystem() {
  const [collections, setCollections] = useState<Collections>({
    classes: [],
    teachers: [],
    subjects: [],
    rooms: [],
    timetables: [],
  });
  const [activeTab, setActiveTab] = useState<Tab>('Timetable');
  const [selectedClassId, setSelectedClassId] = useState<Id | ''>('');
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | null>(null);
  const [editingEntity, setEditingEntity] = useState<{
    type: 'class' | 'teacher' | 'subject' | 'room' | 'timetable';
    id?: Id;
    data?: any;
    timeSlot?: TimeSlot;
  } | null>(null);

  // Load all collections from API
  const loadCollections = async () => {
    try {
      const [classesRes, teachersRes, subjectsRes, roomsRes, timetablesRes] = await Promise.all([
        fetch('/api/classes'),
        fetch('/api/teachers'),
        fetch('/api/subjects'),
        fetch('/api/rooms'),
        fetch('/api/timetables'),
      ]);

      const classes = await classesRes.json();
      const teachers = await teachersRes.json();
      const subjects = await subjectsRes.json();
      const rooms = await roomsRes.json();
      const timetables = await timetablesRes.json();

      setCollections({
        classes: classes.success ? classes.data : [],
        teachers: teachers.success ? teachers.data : [],
        subjects: subjects.success ? subjects.data : [],
        rooms: rooms.success ? rooms.data : [],
        timetables: timetables.success ? timetables.data : [],
      });
    } catch (error) {
      console.error('Error loading collections:', error);
    }
  };

  useEffect(() => {
    loadCollections();
  }, []);

  // Helper functions to update collections after API operations
  const refreshCollections = () => {
    loadCollections();
  };

  const handleExport = async () => {
    try {
      const [classesRes, teachersRes, subjectsRes, roomsRes, timetablesRes] = await Promise.all([
        fetch('/api/classes'),
        fetch('/api/teachers'),
        fetch('/api/subjects'),
        fetch('/api/rooms'),
        fetch('/api/timetables'),
      ]);

      const classes = await classesRes.json();
      const teachers = await teachersRes.json();
      const subjects = await subjectsRes.json();
      const rooms = await roomsRes.json();
      const timetables = await timetablesRes.json();

      const data = {
        classes: classes.success ? classes.data : [],
        teachers: teachers.success ? teachers.data : [],
        subjects: subjects.success ? subjects.data : [],
        rooms: rooms.success ? rooms.data : [],
        timetables: timetables.success ? timetables.data : [],
      };

      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'timetable-data.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data');
    }
  };

  const handleReset = () => {
    alert('Reset functionality removed. Please delete data manually through the API or database.');
  };

  // Entity CRUD helpers
  const handleAddClass = async (data: Omit<ClassDoc, 'id'>) => {
    try {
      const res = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        await refreshCollections();
        setEditingEntity(null);
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to add class');
      }
    } catch (error) {
      console.error('Error adding class:', error);
      alert('Failed to add class');
    }
  };

  const handleUpdateClass = async (id: Id, data: Partial<ClassDoc>) => {
    try {
      const res = await fetch('/api/classes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data }),
      });
      if (res.ok) {
        await refreshCollections();
        setEditingEntity(null);
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to update class');
      }
    } catch (error) {
      console.error('Error updating class:', error);
      alert('Failed to update class');
    }
  };

  const handleDeleteClass = async (id: Id) => {
    if (confirm('Are you sure you want to delete this class?')) {
      try {
        const res = await fetch(`/api/classes?id=${id}`, { method: 'DELETE' });
        if (res.ok) {
          await refreshCollections();
        } else {
          const error = await res.json();
          alert(error.error || 'Failed to delete class');
        }
      } catch (error) {
        console.error('Error deleting class:', error);
        alert('Failed to delete class');
      }
    }
  };

  const handleAddTeacher = async (data: Omit<TeacherDoc, 'id'>) => {
    try {
      const res = await fetch('/api/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        await refreshCollections();
        setEditingEntity(null);
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to add teacher');
      }
    } catch (error) {
      console.error('Error adding teacher:', error);
      alert('Failed to add teacher');
    }
  };

  const handleUpdateTeacher = async (id: Id, data: Partial<TeacherDoc>) => {
    try {
      const res = await fetch('/api/teachers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data }),
      });
      if (res.ok) {
        await refreshCollections();
        setEditingEntity(null);
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to update teacher');
      }
    } catch (error) {
      console.error('Error updating teacher:', error);
      alert('Failed to update teacher');
    }
  };

  const handleDeleteTeacher = async (id: Id) => {
    if (confirm('Are you sure you want to delete this teacher?')) {
      try {
        const res = await fetch(`/api/teachers?id=${id}`, { method: 'DELETE' });
        if (res.ok) {
          await refreshCollections();
        } else {
          const error = await res.json();
          alert(error.error || 'Failed to delete teacher');
        }
      } catch (error) {
        console.error('Error deleting teacher:', error);
        alert('Failed to delete teacher');
      }
    }
  };

  const handleAddSubject = async (data: Omit<SubjectDoc, 'id'>) => {
    try {
      const res = await fetch('/api/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        await refreshCollections();
        setEditingEntity(null);
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to add subject');
      }
    } catch (error) {
      console.error('Error adding subject:', error);
      alert('Failed to add subject');
    }
  };

  const handleUpdateSubject = async (id: Id, data: Partial<SubjectDoc>) => {
    try {
      const res = await fetch('/api/subjects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data }),
      });
      if (res.ok) {
        await refreshCollections();
        setEditingEntity(null);
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to update subject');
      }
    } catch (error) {
      console.error('Error updating subject:', error);
      alert('Failed to update subject');
    }
  };

  const handleDeleteSubject = async (id: Id) => {
    if (confirm('Are you sure you want to delete this subject?')) {
      try {
        const res = await fetch(`/api/subjects?id=${id}`, { method: 'DELETE' });
        if (res.ok) {
          await refreshCollections();
        } else {
          const error = await res.json();
          alert(error.error || 'Failed to delete subject');
        }
      } catch (error) {
        console.error('Error deleting subject:', error);
        alert('Failed to delete subject');
      }
    }
  };

  const handleAddRoom = async (data: Omit<RoomDoc, 'id'>) => {
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        await refreshCollections();
        setEditingEntity(null);
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to add room');
      }
    } catch (error) {
      console.error('Error adding room:', error);
      alert('Failed to add room');
    }
  };

  const handleUpdateRoom = async (id: Id, data: Partial<RoomDoc>) => {
    try {
      const res = await fetch('/api/rooms', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data }),
      });
      if (res.ok) {
        await refreshCollections();
        setEditingEntity(null);
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to update room');
      }
    } catch (error) {
      console.error('Error updating room:', error);
      alert('Failed to update room');
    }
  };

  const handleDeleteRoom = async (id: Id) => {
    if (confirm('Are you sure you want to delete this room?')) {
      try {
        const res = await fetch(`/api/rooms?id=${id}`, { method: 'DELETE' });
        if (res.ok) {
          await refreshCollections();
        } else {
          const error = await res.json();
          alert(error.error || 'Failed to delete room');
        }
      } catch (error) {
        console.error('Error deleting room:', error);
        alert('Failed to delete room');
      }
    }
  };

  const handleUpsertTimetable = async (data: Omit<TimetableDoc, 'id'>) => {
    try {
      const res = await fetch('/api/timetables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        await refreshCollections();
        setEditingEntity(null);
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to save timetable');
      }
    } catch (error) {
      console.error('Error saving timetable:', error);
      alert('Failed to save timetable');
    }
  };

  const handleDeleteTimetable = async (id: Id) => {
    if (confirm('Are you sure you want to delete this timetable entry?')) {
      try {
        const res = await fetch(`/api/timetables?id=${id}`, { method: 'DELETE' });
        if (res.ok) {
          await refreshCollections();
        } else {
          const error = await res.json();
          alert(error.error || 'Failed to delete timetable');
        }
      } catch (error) {
        console.error('Error deleting timetable:', error);
        alert('Failed to delete timetable');
      }
    }
  };

  // Render entity form modal
  const renderEntityForm = () => {
    if (!editingEntity) return null;

    const { type, id, data, timeSlot } = editingEntity;

    if (type === 'class') {
      const classData = data || { name: '', section: '', grade: 10 };
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-xl font-bold">{id ? 'Edit Class' : 'Add Class'}</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const classData = {
                  name: formData.get('name') as string,
                  section: formData.get('section') as string,
                  grade: Number(formData.get('grade')),
                };
                if (id) {
                  handleUpdateClass(id, classData);
                } else {
                  handleAddClass(classData);
                }
              }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={classData.name}
                    required
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Section</label>
                  <input
                    type="text"
                    name="section"
                    defaultValue={classData.section}
                    required
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Grade</label>
                  <input
                    type="number"
                    name="grade"
                    defaultValue={classData.grade}
                    required
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingEntity(null)}
                  className="rounded-md border border-gray-300 px-4 py-2"
                >
                  Cancel
                </button>
                <button type="submit" className="rounded-md bg-blue-600 px-4 py-2 text-white">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      );
    }

    if (type === 'teacher') {
      const teacherData = data || { name: '', email: '', specialization: '' };
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-xl font-bold">{id ? 'Edit Teacher' : 'Add Teacher'}</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const teacherData = {
                  name: formData.get('name') as string,
                  email: formData.get('email') as string,
                  specialization: formData.get('specialization') as string,
                };
                if (id) {
                  handleUpdateTeacher(id, teacherData);
                } else {
                  handleAddTeacher(teacherData);
                }
              }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={teacherData.name}
                    required
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={teacherData.email}
                    required
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Specialization</label>
                  <input
                    type="text"
                    name="specialization"
                    defaultValue={teacherData.specialization}
                    required
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingEntity(null)}
                  className="rounded-md border border-gray-300 px-4 py-2"
                >
                  Cancel
                </button>
                <button type="submit" className="rounded-md bg-blue-600 px-4 py-2 text-white">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      );
    }

    if (type === 'subject') {
      const subjectData = data || { name: '', code: '' };
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-xl font-bold">{id ? 'Edit Subject' : 'Add Subject'}</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const subjectData = {
                  name: formData.get('name') as string,
                  code: formData.get('code') as string,
                };
                if (id) {
                  handleUpdateSubject(id, subjectData);
                } else {
                  handleAddSubject(subjectData);
                }
              }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={subjectData.name}
                    required
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Code</label>
                  <input
                    type="text"
                    name="code"
                    defaultValue={subjectData.code}
                    required
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingEntity(null)}
                  className="rounded-md border border-gray-300 px-4 py-2"
                >
                  Cancel
                </button>
                <button type="submit" className="rounded-md bg-blue-600 px-4 py-2 text-white">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      );
    }

    if (type === 'room') {
      const roomData = data || { name: '', capacity: 30, building: '' };
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-xl font-bold">{id ? 'Edit Room' : 'Add Room'}</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const roomData = {
                  name: formData.get('name') as string,
                  capacity: Number(formData.get('capacity')),
                  building: formData.get('building') as string,
                };
                if (id) {
                  handleUpdateRoom(id, roomData);
                } else {
                  handleAddRoom(roomData);
                }
              }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={roomData.name}
                    required
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Capacity</label>
                  <input
                    type="number"
                    name="capacity"
                    defaultValue={roomData.capacity}
                    required
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Building</label>
                  <input
                    type="text"
                    name="building"
                    defaultValue={roomData.building}
                    required
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingEntity(null)}
                  className="rounded-md border border-gray-300 px-3 py-2"
                >
                  Cancel
                </button>
                <button type="submit" className="rounded-md bg-blue-600 px-4 py-2 text-white">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      );
    }

    if (type === 'timetable') {
      const timetableData = data || {
        classId: selectedClassId || '',
        day: selectedDay || 'Monday',
        timeSlot: timeSlot || '09:00-10:00',
        subjectId: '',
        teacherId: '',
        roomId: '',
      };
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-xl font-bold">Edit Timetable Entry</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const timetableData = {
                  classId: formData.get('classId') as Id,
                  day: (formData.get('day') as DayOfWeek) || selectedDay || 'Monday',
                  timeSlot: (formData.get('timeSlot') as TimeSlot) || timeSlot || '09:00-10:00',
                  subjectId: formData.get('subjectId') as Id,
                  teacherId: formData.get('teacherId') as Id,
                  roomId: formData.get('roomId') as Id,
                };
                handleUpsertTimetable(timetableData);
              }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Class</label>
                  <select
                    name="classId"
                    defaultValue={timetableData.classId}
                    required
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                  >
                    <option value="">Select Class</option>
                    {collections.classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} - {c.section} (Grade {c.grade})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Day</label>
                  <select
                    name="day"
                    defaultValue={timetableData.day}
                    required
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                  >
                    {DAYS.map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Time Slot</label>
                  <select
                    name="timeSlot"
                    defaultValue={timetableData.timeSlot}
                    required
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                  >
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Subject</label>
                  <select
                    name="subjectId"
                    defaultValue={timetableData.subjectId}
                    required
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                  >
                    <option value="">Select Subject</option>
                    {collections.subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Teacher</label>
                  <select
                    name="teacherId"
                    defaultValue={timetableData.teacherId}
                    required
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                  >
                    <option value="">Select Teacher</option>
                    {collections.teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.specialization})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Room</label>
                  <select
                    name="roomId"
                    defaultValue={timetableData.roomId}
                    required
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                  >
                    <option value="">Select Room</option>
                    {collections.rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} - {r.building} (Capacity: {r.capacity})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingEntity(null)}
                  className="rounded-md border border-gray-300 px-4 py-2"
                >
                  Cancel
                </button>
                <button type="submit" className="rounded-md bg-blue-600 px-4 py-2 text-white">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Timetable Management System</h1>
            <div className="flex gap-3">
              <button
                onClick={handleExport}
                className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
              >
                Export JSON
              </button>
              <button
                onClick={handleReset}
                className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
              >
                Reset Data
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="text-sm font-medium text-gray-500">Total Classes</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">{collections.classes.length}</div>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="text-sm font-medium text-gray-500">Total Teachers</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">{collections.teachers.length}</div>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="text-sm font-medium text-gray-500">Total Subjects</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">{collections.subjects.length}</div>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="text-sm font-medium text-gray-500">Total Rooms</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">{collections.rooms.length}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {(['Timetable', 'Classes', 'Teachers', 'Subjects', 'Rooms'] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          {activeTab === 'Timetable' && (
            <div>
              <div className="mb-6 flex flex-wrap gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Select Class</label>
                  <select
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value as Id)}
                    className="mt-1 rounded-md border border-gray-300 px-3 py-2"
                  >
                    <option value="">Select a class</option>
                    {collections.classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} - {c.section} (Grade {c.grade})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Select Day</label>
                  <div className="mt-1 flex gap-2">
                    {DAYS.map((day) => (
                      <button
                        key={day}
                        onClick={() => setSelectedDay(day)}
                        className={`rounded-md px-3 py-2 text-sm ${
                          selectedDay === day
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {selectedClassId && selectedDay && (
                <div>
                  <h3 className="mb-4 text-lg font-semibold">
                    {collections.classes.find((c) => c.id === selectedClassId)?.name} - {selectedDay}
                  </h3>
                  <div className="space-y-2">
                    {TIME_SLOTS.map((slot) => {
                      const entry = collections.timetables.find(
                        (t) =>
                          t.classId === selectedClassId &&
                          t.day === selectedDay &&
                          t.timeSlot === slot
                      );
                      const subject = entry
                        ? collections.subjects.find((s) => s.id === entry.subjectId)
                        : null;
                      const teacher = entry
                        ? collections.teachers.find((t) => t.id === entry.teacherId)
                        : null;
                      const room = entry ? collections.rooms.find((r) => r.id === entry.roomId) : null;

                      return (
                        <div
                          key={slot}
                          className="flex items-center justify-between rounded-md border border-gray-200 p-4"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{slot}</div>
                            {entry ? (
                              <div className="mt-1 text-sm text-gray-600">
                                <span className="font-medium">{subject?.name}</span> -{' '}
                                <span>{teacher?.name}</span> - <span>Room: {room?.name}</span>
                              </div>
                            ) : (
                              <div className="mt-1 text-sm text-gray-400">No entry</div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                setEditingEntity({
                                  type: 'timetable',
                                  data: entry
                                    ? {
                                        classId: entry.classId,
                                        day: entry.day,
                                        timeSlot: entry.timeSlot,
                                        subjectId: entry.subjectId,
                                        teacherId: entry.teacherId,
                                        roomId: entry.roomId,
                                      }
                                    : {
                                        classId: selectedClassId,
                                        day: selectedDay,
                                        timeSlot: slot,
                                        subjectId: '',
                                        teacherId: '',
                                        roomId: '',
                                      },
                                  timeSlot: slot,
                                })
                              }
                              className="rounded-md bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                            >
                              {entry ? 'Edit' : 'Add'}
                            </button>
                            {entry && (
                              <button
                                onClick={() => handleDeleteTimetable(entry.id)}
                                className="rounded-md bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {(!selectedClassId || !selectedDay) && (
                <div className="py-12 text-center text-gray-500">
                  Please select a class and day to view the timetable
                </div>
              )}
            </div>
          )}

          {activeTab === 'Classes' && (
            <div>
              <div className="mb-4 flex justify-between">
                <h2 className="text-xl font-semibold">Classes</h2>
                <button
                  onClick={() => setEditingEntity({ type: 'class' })}
                  className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Add Class
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                        Section
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                        Grade
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {collections.classes.map((c) => (
                      <tr key={c.id}>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{c.name}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{c.section}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{c.grade}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                          <button
                            onClick={() => setEditingEntity({ type: 'class', id: c.id, data: c })}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClass(c.id)}
                            className="ml-4 text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {collections.classes.length === 0 && (
                  <div className="py-8 text-center text-gray-500">No classes found</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'Teachers' && (
            <div>
              <div className="mb-4 flex justify-between">
                <h2 className="text-xl font-semibold">Teachers</h2>
                <button
                  onClick={() => setEditingEntity({ type: 'teacher' })}
                  className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Add Teacher
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                        Specialization
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {collections.teachers.map((t) => (
                      <tr key={t.id}>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{t.name}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{t.email}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                          {t.specialization}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                          <button
                            onClick={() => setEditingEntity({ type: 'teacher', id: t.id, data: t })}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteTeacher(t.id)}
                            className="ml-4 text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {collections.teachers.length === 0 && (
                  <div className="py-8 text-center text-gray-500">No teachers found</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'Subjects' && (
            <div>
              <div className="mb-4 flex justify-between">
                <h2 className="text-xl font-semibold">Subjects</h2>
                <button
                  onClick={() => setEditingEntity({ type: 'subject' })}
                  className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Add Subject
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                        Code
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {collections.subjects.map((s) => (
                      <tr key={s.id}>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{s.name}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{s.code}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                          <button
                            onClick={() => setEditingEntity({ type: 'subject', id: s.id, data: s })}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteSubject(s.id)}
                            className="ml-4 text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {collections.subjects.length === 0 && (
                  <div className="py-8 text-center text-gray-500">No subjects found</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'Rooms' && (
            <div>
              <div className="mb-4 flex justify-between">
                <h2 className="text-xl font-semibold">Rooms</h2>
                <button
                  onClick={() => setEditingEntity({ type: 'room' })}
                  className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Add Room
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                        Capacity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                        Building
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {collections.rooms.map((r) => (
                      <tr key={r.id}>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{r.name}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{r.capacity}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{r.building}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                          <button
                            onClick={() => setEditingEntity({ type: 'room', id: r.id, data: r })}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteRoom(r.id)}
                            className="ml-4 text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {collections.rooms.length === 0 && (
                  <div className="py-8 text-center text-gray-500">No rooms found</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Entity Form Modal */}
      {renderEntityForm()}
    </div>
  );
}

