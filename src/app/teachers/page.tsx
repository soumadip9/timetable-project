'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

type Teacher = {
  id: string;
  name: string;
  email: string;
  specialization: string;
};

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  async function loadTeachers() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/teachers');
      if (res.ok) {
        const data = await res.json();
        setTeachers(data.teachers || []);
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'Failed to load teachers');
      }
    } catch (err: any) {
      setError(err.message ?? 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTeachers();
  }, []);

  const handleAdd = () => {
    setEditingTeacher(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: Teacher) => {
    setEditingTeacher(item);
    setIsModalOpen(true);
  };

  const handleSave = async (formData: Record<string, any>) => {
    try {
      const { name, email, specialization } = formData;
      
      console.log('💾 Saving teacher:', { name, email, specialization, isEdit: !!editingTeacher });
      
      if (editingTeacher) {
        const res = await fetch('/api/teachers', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingTeacher.id, name, email, specialization }),
        });
        
        const data = await res.json();
        console.log('📤 PUT response:', { status: res.status, data });
        
        if (!res.ok) {
          throw new Error(data.error || 'Failed to update teacher');
        }
      } else {
        const res = await fetch('/api/teachers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, specialization }),
        });
        
        const data = await res.json();
        console.log('📤 POST response:', { status: res.status, data });
        
        if (!res.ok) {
          throw new Error(data.error || 'Failed to add teacher');
        }
      }
      
      console.log('✅ Teacher saved successfully, reloading...');
      await loadTeachers();
      setIsModalOpen(false);
      setEditingTeacher(null);
    } catch (err: any) {
      console.error('❌ Error saving teacher:', err);
      const errorMessage = err.message || 'Failed to save teacher';
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this teacher?')) return;
    
    try {
      const res = await fetch('/api/teachers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete teacher');
      }
      
      await loadTeachers();
    } catch (err: any) {
      alert(err.message || 'Failed to delete teacher');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        <Link href="/" className="mb-4 text-blue-600 hover:text-blue-800">
          ← Back to Dashboard
        </Link>
        
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Teachers</h2>
          <button
            onClick={handleAdd}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            Add Teacher
          </button>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm">
          {teachers.length === 0 ? (
            <div className="py-8 text-center text-gray-500">No teachers found</div>
          ) : (
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
                  {teachers.map((teacher) => (
                    <tr key={teacher.id}>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{teacher.name}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{teacher.email}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {teacher.specialization}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(teacher)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(teacher.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal for Add/Edit */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
              <h3 className="mb-4 text-xl font-bold text-gray-900">
                {editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
              </h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleSave({
                    name: formData.get('name') as string,
                    email: formData.get('email') as string,
                    specialization: formData.get('specialization') as string,
                  });
                }}
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={editingTeacher?.name || ''}
                      required
                      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      defaultValue={editingTeacher?.email || ''}
                      required
                      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Specialization <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="specialization"
                      defaultValue={editingTeacher?.specialization || ''}
                      required
                      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingTeacher(null);
                    }}
                    className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

