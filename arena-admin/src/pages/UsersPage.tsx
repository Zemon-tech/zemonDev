import React, { useEffect, useState } from 'react';

interface User {
  _id: string;
  fullName: string;
  username: string;
  email: string;
  createdAt: string;
}

interface ApiResponse {
  users: User[];
  page: number;
  limit: number;
  total: number;
}

const emptyForm: Partial<User> = {
  fullName: '',
  username: '',
  email: '',
};

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<Partial<User>>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);

  const fetchUsers = async (pageNum = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `http://localhost:3001/api/dev-admin/users?page=${pageNum}&limit=${limit}`
      );
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data.data.users);
      setPage(data.data.page);
      setTotal(data.data.total);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      const res = await fetch(
        `http://localhost:3001/api/dev-admin/users/${id}`,
        { method: 'DELETE' }
      );
      if (!res.ok) throw new Error('Failed to delete user');
      fetchUsers(page);
    } catch (err: any) {
      alert(err.message || 'Delete failed');
    }
  };

  const openCreateModal = () => {
    setForm(emptyForm);
    setEditId(null);
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setForm({ ...user });
    setEditId(user._id);
    setFormError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setForm(emptyForm);
    setEditId(null);
    setFormError(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!form.fullName || !form.username || !form.email) {
      setFormError('All fields are required.');
      return;
    }
    try {
      const method = editId ? 'PUT' : 'POST';
      const url = editId
        ? `http://localhost:3001/api/dev-admin/users/${editId}`
        : 'http://localhost:3001/api/dev-admin/users';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to save user');
      closeModal();
      fetchUsers(page);
    } catch (err: any) {
      setFormError(err.message || 'Save failed');
    }
  };

  const handleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selected.length === users.length) {
      setSelected([]);
    } else {
      setSelected(users.map((u) => u._id));
    }
  };

  const handleBulkDelete = async () => {
    if (selected.length === 0) return;
    if (!window.confirm(`Delete ${selected.length} selected users?`)) return;
    try {
      const res = await fetch('http://localhost:3001/api/dev-admin/users/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selected }),
      });
      if (!res.ok) throw new Error('Failed to bulk delete users');
      setSelected([]);
      fetchUsers(page);
    } catch (err: any) {
      alert(err.message || 'Bulk delete failed');
    }
  };

  const openBulkModal = () => {
    setBulkError(null);
    setBulkModalOpen(true);
  };
  const closeBulkModal = () => {
    setBulkModalOpen(false);
    setBulkError(null);
  };

  const handleBulkFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setBulkError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    setBulkLoading(true);
    try {
      let users: any[] = [];
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        const text = await file.text();
        users = JSON.parse(text);
      } else if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        const text = await file.text();
        const [headerLine, ...lines] = text.split(/\r?\n/).filter(Boolean);
        const headers = headerLine.split(',').map(h => h.trim());
        users = lines.map(line => {
          const values = line.split(',').map(v => v.trim());
          const obj: any = {};
          headers.forEach((h, i) => { obj[h] = values[i]; });
          return obj;
        });
      } else {
        throw new Error('Unsupported file type. Use CSV or JSON.');
      }
      if (!Array.isArray(users) || users.length === 0) throw new Error('No users found in file.');
      // Basic validation
      for (const u of users) {
        if (!u.fullName || !u.username || !u.email) throw new Error('Each user must have fullName, username, and email.');
      }
      const res = await fetch('http://localhost:3001/api/dev-admin/users/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(users),
      });
      if (!res.ok) throw new Error('Bulk create failed');
      closeBulkModal();
      fetchUsers(page);
    } catch (err: any) {
      setBulkError(err.message || 'Bulk create failed');
    } finally {
      setBulkLoading(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Users</h1>
      <div className="flex items-center gap-2 mb-4">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={openCreateModal}
        >
          New User
        </button>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          onClick={openBulkModal}
        >
          Bulk Create
        </button>
        <button
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
          onClick={handleBulkDelete}
          disabled={selected.length === 0}
        >
          Bulk Delete
        </button>
      </div>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <table className="min-w-full bg-white border border-gray-200 mb-4">
            <thead>
              <tr>
                <th className="px-2 py-1 border">
                  <input
                    type="checkbox"
                    checked={selected.length === users.length && users.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-2 py-1 border">Full Name</th>
                <th className="px-2 py-1 border">Username</th>
                <th className="px-2 py-1 border">Email</th>
                <th className="px-2 py-1 border">Created At</th>
                <th className="px-2 py-1 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="px-2 py-1 border text-center">
                    <input
                      type="checkbox"
                      checked={selected.includes(user._id)}
                      onChange={() => handleSelect(user._id)}
                    />
                  </td>
                  <td className="px-2 py-1 border">{user.fullName}</td>
                  <td className="px-2 py-1 border">{user.username}</td>
                  <td className="px-2 py-1 border">{user.email}</td>
                  <td className="px-2 py-1 border">{new Date(user.createdAt).toLocaleString()}</td>
                  <td className="px-2 py-1 border flex gap-2">
                    <button
                      className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                      onClick={() => openEditModal(user)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                      onClick={() => handleDelete(user._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-4">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Prev
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={closeModal}
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">{editId ? 'Edit User' : 'New User'}</h2>
            {formError && <div className="text-red-500 mb-2">{formError}</div>}
            <form onSubmit={handleFormSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName || ''}
                  onChange={handleFormChange}
                  className="w-full border rounded px-2 py-1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Username</label>
                <input
                  type="text"
                  name="username"
                  value={form.username || ''}
                  onChange={handleFormChange}
                  className="w-full border rounded px-2 py-1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email || ''}
                  onChange={handleFormChange}
                  className="w-full border rounded px-2 py-1"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-200 rounded"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {editId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Bulk Create Modal */}
      {bulkModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={closeBulkModal}
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">Bulk Create Users</h2>
            {bulkError && <div className="text-red-500 mb-2">{bulkError}</div>}
            <div className="mb-4 text-sm text-gray-600">
              Upload a CSV or JSON file. Required fields: <b>fullName, username, email</b>.<br />
              Example CSV: <code>fullName,username,email\nJohn Doe,johndoe,john@example.com</code>
            </div>
            <input
              type="file"
              accept=".csv,application/json"
              onChange={handleBulkFile}
              disabled={bulkLoading}
              className="mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="px-4 py-2 bg-gray-200 rounded"
                onClick={closeBulkModal}
                disabled={bulkLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage; 