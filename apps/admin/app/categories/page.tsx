'use client';

import { FormEvent, useEffect, useState } from 'react';
import { apiDelete, apiGet, apiPatch, apiPost } from '../../lib/api';
import { getAccessToken } from '../../lib/auth-storage';

interface CategoryGroup {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  isActive: boolean;
  sortOrder: number;
  groupId: string | null;
  group?: CategoryGroup | null;
}

const EMPTY_CAT_FORM = { name: '', description: '', icon: '', sortOrder: 0, groupId: '' };
const EMPTY_GROUP_FORM = { name: '', sortOrder: 0 };

export default function CategoriesPage() {
  const [activeTab, setActiveTab] = useState<'categories' | 'groups'>('categories');
  const [categories, setCategories] = useState<Category[]>([]);
  const [groups, setGroups] = useState<CategoryGroup[]>([]);
  
  const [catForm, setCatForm] = useState(EMPTY_CAT_FORM);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  
  const [groupForm, setGroupForm] = useState(EMPTY_GROUP_FORM);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([
      apiGet<Category[]>('/admin/categories', getAccessToken()),
      apiGet<CategoryGroup[]>('/admin/category-groups', getAccessToken())
    ])
      .then(([cats, grps]) => {
        setCategories(cats);
        setGroups(grps);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  async function handleCatSubmit(e: FormEvent) {
    e.preventDefault();
    const token = getAccessToken();
    const payload = { ...catForm, groupId: catForm.groupId || null };
    if (editingCatId) {
      await apiPatch(`/admin/categories/${editingCatId}`, payload, token);
    } else {
      await apiPost('/admin/categories', payload, token);
    }
    setCatForm(EMPTY_CAT_FORM);
    setEditingCatId(null);
    load();
  }

  async function handleGroupSubmit(e: FormEvent) {
    e.preventDefault();
    const token = getAccessToken();
    if (editingGroupId) {
      await apiPatch(`/admin/category-groups/${editingGroupId}`, groupForm, token);
    } else {
      await apiPost('/admin/category-groups', groupForm, token);
    }
    setGroupForm(EMPTY_GROUP_FORM);
    setEditingGroupId(null);
    load();
  }

  async function deactivateCat(id: string) {
    await apiDelete(`/admin/categories/${id}`, getAccessToken());
    load();
  }

  async function deactivateGroup(id: string) {
    await apiDelete(`/admin/category-groups/${id}`, getAccessToken());
    load();
  }

  if (loading) return <p className="text-gray-500">Loading...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black">Categories & Groups</h1>
        <div className="flex bg-white rounded-lg border overflow-hidden">
          <button 
            className={`px-4 py-2 font-bold ${activeTab === 'categories' ? 'bg-brand-navy text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('categories')}
          >
            Categories
          </button>
          <button 
            className={`px-4 py-2 font-bold ${activeTab === 'groups' ? 'bg-brand-navy text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('groups')}
          >
            Groups
          </button>
        </div>
      </div>

      {activeTab === 'groups' && (
        <>
          <form onSubmit={handleGroupSubmit} className="bg-white p-6 rounded-xl border mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              required
              placeholder="Group name"
              value={groupForm.name}
              onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
              className="border rounded-lg px-3 py-2"
            />
            <input
              type="number"
              placeholder="Sort order"
              value={groupForm.sortOrder}
              onChange={(e) => setGroupForm({ ...groupForm, sortOrder: Number(e.target.value) })}
              className="border rounded-lg px-3 py-2"
            />
            <button type="submit" className="bg-brand-green text-white font-bold rounded-lg px-4 py-2 md:col-span-2">
              {editingGroupId ? 'Update group' : 'Add group'}
            </button>
          </form>

          <div className="space-y-3">
            {groups.map((grp) => (
              <div key={grp.id} className="bg-white p-4 rounded-xl border flex justify-between items-center gap-4">
                <div>
                  <p className="font-bold">{grp.name} <span className="text-gray-400 font-normal">/{grp.slug}</span></p>
                  <p className="text-sm text-gray-500">Sort Order: {grp.sortOrder}</p>
                </div>
                <div className="flex gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${grp.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>
                    {grp.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingGroupId(grp.id);
                      setGroupForm({
                        name: grp.name,
                        sortOrder: grp.sortOrder,
                      });
                    }}
                    className="text-sm font-bold text-brand-navy"
                  >
                    Edit
                  </button>
                  {grp.isActive && (
                    <button type="button" onClick={() => deactivateGroup(grp.id)} className="text-sm font-bold text-red-600">
                      Deactivate
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'categories' && (
        <>
          <form onSubmit={handleCatSubmit} className="bg-white p-6 rounded-xl border mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              required
              placeholder="Category name"
              value={catForm.name}
              onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
              className="border rounded-lg px-3 py-2"
            />
            <input
              placeholder="Icon (emoji)"
              value={catForm.icon}
              onChange={(e) => setCatForm({ ...catForm, icon: e.target.value })}
              className="border rounded-lg px-3 py-2"
            />
            <select 
              value={catForm.groupId} 
              onChange={(e) => setCatForm({ ...catForm, groupId: e.target.value })}
              className="border rounded-lg px-3 py-2"
            >
              <option value="">No Group</option>
              {groups.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Sort order"
              value={catForm.sortOrder}
              onChange={(e) => setCatForm({ ...catForm, sortOrder: Number(e.target.value) })}
              className="border rounded-lg px-3 py-2"
            />
            <input
              placeholder="Description"
              value={catForm.description}
              onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
              className="border rounded-lg px-3 py-2 md:col-span-2"
            />
            <button type="submit" className="bg-brand-green text-white font-bold rounded-lg px-4 py-2 md:col-span-2">
              {editingCatId ? 'Update category' : 'Add category'}
            </button>
          </form>

          <div className="space-y-3">
            {categories.map((cat) => (
              <div key={cat.id} className="bg-white p-4 rounded-xl border flex justify-between items-center gap-4">
                <div>
                  <p className="font-bold">{cat.icon} {cat.name} <span className="text-gray-400 font-normal">/{cat.slug}</span></p>
                  <p className="text-sm text-gray-500">{cat.description}</p>
                  {cat.group && <span className="inline-block mt-1 text-xs px-2 py-1 bg-gray-100 rounded text-gray-600">{cat.group.name}</span>}
                </div>
                <div className="flex gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${cat.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>
                    {cat.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCatId(cat.id);
                      setCatForm({
                        name: cat.name,
                        description: cat.description || '',
                        icon: cat.icon || '',
                        sortOrder: cat.sortOrder,
                        groupId: cat.groupId || ''
                      });
                    }}
                    className="text-sm font-bold text-brand-navy"
                  >
                    Edit
                  </button>
                  {cat.isActive && (
                    <button type="button" onClick={() => deactivateCat(cat.id)} className="text-sm font-bold text-red-600">
                      Deactivate
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
