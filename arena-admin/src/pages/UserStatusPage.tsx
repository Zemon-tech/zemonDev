import React, { useEffect, useState } from 'react';

interface UserChannelStatus {
  _id: string;
  userId: string;
  channelId: string;
  isBanned?: boolean;
  isMuted?: boolean;
  createdAt: string;
}

interface ApiResponse {
  status: UserChannelStatus[];
  page: number;
  limit: number;
  total: number;
}

const emptyForm: Partial<UserChannelStatus> = {
  userId: '',
  channelId: '',
  isBanned: false,
  isMuted: false,
};

const UserStatusPage: React.FC = () => {
  const [status, setStatus] = useState<UserChannelStatus[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<Partial<UserChannelStatus>>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchStatus = async (pageNum = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `http://localhost:3001/api/dev-admin/user-status?page=${pageNum}&limit=${limit}`
      );
      if (!res.ok) throw new Error('Failed to fetch user status');
      const data = await res.json();
      setStatus(data.data.status);
      setPage(data.data.page);
      setTotal(data.data.total);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this user status?')) return;
    try {
      const res = await fetch(
        `http://localhost:3001/api/dev-admin/user-status/${id}`,
        { method: 'DELETE' }
      );
      if (!res.ok) throw new Error('Failed to delete user status');
      fetchStatus(page);
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

  const openEditModal = (status: UserChannelStatus) => {
    setForm({
      userId: status.userId,
      channelId: status.channelId,
      isBanned: status.isBanned || false,
      isMuted: status.isMuted || false,
    });
    setEditId(status._id);
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
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!form.userId || !form.channelId) {
      setFormError('User ID and Channel ID are required.');
      return;
    }
    try {
      const method = editId ? 'PUT' : 'POST';
      const url = editId
        ? `http://localhost:3001/api/dev-admin/user-status/${editId}`
        : 'http://localhost:3001/api/dev-admin/user-status';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to save user status');
      closeModal();
      fetchStatus(page);
    } catch (err: any) {
      setFormError(err.message || 'Save failed');
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">User Channel Status</h1>
      <button
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        onClick={openCreateModal}
      >
        New Status
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
                <th className="px-2 py-1 border">Channel ID</th>
                <th className="px-2 py-1 border">Banned</th>
                <th className="px-2 py-1 border">Muted</th>
                <th className="px-2 py-1 border">Created At</th>
                <th className="px-2 py-1 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {status.map((s) => (
                <tr key={s._id}>
                  <td className="px-2 py-1 border">{s.userId}</td>
                  <td className="px-2 py-1 border">{s.channelId}</td>
                  <td className="px-2 py-1 border text-center">{s.isBanned ? 'Yes' : 'No'}</td>
                  <td className="px-2 py-1 border text-center">{s.isMuted ? 'Yes' : 'No'}</td>
                  <td className="px-2 py-1 border">{new Date(s.createdAt).toLocaleString()}</td>
                  <td className="px-2 py-1 border flex gap-2">
                    <button
                      className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                      onClick={() => openEditModal(s)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                      onClick={() => handleDelete(s._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {status.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-4">No user status found.</td>
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
            <h2 className="text-xl font-bold mb-4">{editId ? 'Edit Status' : 'New Status'}</h2>
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
                <label className="block text-sm font-medium">Channel ID</label>
                <input
                  type="text"
                  name="channelId"
                  value={form.channelId || ''}
                  onChange={handleFormChange}
                  className="w-full border rounded px-2 py-1"
                  required
                />
              </div>
              <div className="flex gap-4">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    name="isBanned"
                    checked={!!form.isBanned}
                    onChange={handleFormChange}
                    className="mr-2"
                  />
                  Banned
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    name="isMuted"
                    checked={!!form.isMuted}
                    onChange={handleFormChange}
                    className="mr-2"
                  />
                  Muted
                </label>
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

export default UserStatusPage; 