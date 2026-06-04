'use client';

import { FormEvent, useEffect, useState } from 'react';
import { apiDelete, apiGet, apiPatch, apiPost } from '../../lib/api';
import { getAccessToken } from '../../lib/auth-storage';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  isActive: boolean;
  sortOrder: number;
}

const EMPTY_FORM = { name: '', description: '', icon: '', sortOrder: 0 };

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    apiGet<Category[]>('/admin/categories', getAccessToken())
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const token = getAccessToken();
    if (editingId) {
      await apiPatch(`/admin/categories/${editingId}`, form, token);
    } else {
      await apiPost('/admin/categories', form, token);
    }
    setForm(EMPTY_FORM);
    setEditingId(null);
    load();
  }

  async function deactivate(id: string) {
    await apiDelete(`/admin/categories/${id}`, getAccessToken());
    load();
  }

  if (loading) return <p className="text-gray-500">Loading categories...</p>;

  return (
    <div>
      <h1 className="text-3xl font-black mb-8">Service Categories</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          required
          placeholder="Category name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="border rounded-lg px-3 py-2"
        />
        <input
          placeholder="Icon (emoji)"
          value={form.icon}
          onChange={(e) => setForm({ ...form, icon: e.target.value })}
          className="border rounded-lg px-3 py-2"
        />
        <input
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="border rounded-lg px-3 py-2 md:col-span-2"
        />
        <input
          type="number"
          placeholder="Sort order"
          value={form.sortOrder}
          onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
          className="border rounded-lg px-3 py-2"
        />
        <button type="submit" className="bg-brand-green text-white font-bold rounded-lg px-4 py-2">
          {editingId ? 'Update category' : 'Add category'}
        </button>
      </form>

      <div className="space-y-3">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-white p-4 rounded-xl border flex justify-between items-center gap-4">
            <div>
              <p className="font-bold">{cat.icon} {cat.name} <span className="text-gray-400 font-normal">/{cat.slug}</span></p>
              <p className="text-sm text-gray-500">{cat.description}</p>
            </div>
            <div className="flex gap-2">
              <span className={`text-xs px-2 py-1 rounded-full ${cat.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>
                {cat.isActive ? 'Active' : 'Inactive'}
              </span>
              <button
                type="button"
                onClick={() => {
                  setEditingId(cat.id);
                  setForm({
                    name: cat.name,
                    description: cat.description || '',
                    icon: cat.icon || '',
                    sortOrder: cat.sortOrder,
                  });
                }}
                className="text-sm font-bold text-brand-navy"
              >
                Edit
              </button>
              {cat.isActive && (
                <button type="button" onClick={() => deactivate(cat.id)} className="text-sm font-bold text-red-600">
                  Deactivate
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
