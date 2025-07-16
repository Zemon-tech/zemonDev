import React, { useEffect, useState } from 'react';

interface UserRole {
  _id: string;
  userId: string;
  role: string;
  grantedBy: string;
  createdAt: string;
}

interface ApiResponse {
  roles: UserRole[];
  page: number;
  limit: number;
  total: number;
}

const emptyForm: Partial<UserRole> = {
  userId: '',
  role: '',
  grantedBy: '',
};

const UserRolesPage: React.FC = () => {
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<Partial<UserRole>>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchRoles = async (pageNum = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `http://localhost:3001/api/dev-admin/user-roles?page=${pageNum}&limit=${limit}`
      );
      if (!res.ok) throw new Error('Failed to fetch user roles');
      const data = await res.json();
      setRoles(data.data.roles);
      setPage(data.data.page);
      setTotal(data.data.total);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this user role?')) return;
    try {
      const res = await fetch(
        `http://localhost:3001/api/dev-admin/user-roles/${id}`,
        { method: 'DELETE' }
      );
      if (!res.ok) throw new Error('Failed to delete user role');
      fetchRoles(page);
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

  const openEditModal = (role: UserRole) => {
    setForm({ userId: role.userId, role: role.role, grantedBy: role.grantedBy });
    setEditId(role._id);
    setFormError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setForm(emptyForm);
    setEditId(null);
    setFormError(null);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!form.userId || !form.role || !form.grantedBy) {
      setFormError('All fields are required.');
      return;
    }
    try {
      const method = editId ? 'PUT' : 'POST';
      const url = editId
        ? `http://localhost:3001/api/dev-admin/user-roles/${editId}`
        : 'http://localhost:3001/api/dev-admin/user-roles';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to save user role');
      closeModal();
      fetchRoles(page);
    } catch (err: any) {
      setFormError(err.message || 'Save failed');
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">User Roles</h1>
      <button
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        onClick={openCreateModal}
      >
        New Role
      </button>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <table className="min-w-full bg-white border border-gray-200 mb-4">
            <thead>
              <tr>
                <th className="px-2 py-1 border">User ID</th>
                <th className="px-2 py-1 border">Role</th>
                <th className="px-2 py-1 border">Created At</th>
                <th className="px-2 py-1 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role._id}>
                  <td className="px-2 py-1 border">{role.userId}</td>
                  <td className="px-2 py-1 border">{role.role}</td>
                  <td className="px-2 py-1 border">{new Date(role.createdAt).toLocaleString()}</td>
                  <td className="px-2 py-1 border flex gap-2">
                    <button
                      className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                      onClick={() => openEditModal(role)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                      onClick={() => handleDelete(role._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {roles.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-4">No user roles found.</td>
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
            <h2 className="text-xl font-bold mb-4">{editId ? 'Edit Role' : 'New Role'}</h2>
            {formError && <div className="text-red-500 mb-2">{formError}</div>}
            <form onSubmit={handleFormSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium">User ID</label>
                <input
                  type="text"
                  name="userId"
                  value={form.userId || ''}
                  onChange={handleFormChange}
                  className="w-full border rounded px-2 py-1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Role</label>
                <select
                  name="role"
                  value={form.role || ''}
                  onChange={handleFormChange}
                  className="w-full border rounded px-2 py-1"
                  required
                >
                  <option value="">Select role</option>
                  <option value="user">User</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Granted By (User ID)</label>
                <input
                  type="text"
                  name="grantedBy"
                  value={form.grantedBy || ''}
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
    </div>
  );
};

export default UserRolesPage; 