import React, { useEffect, useState } from 'react';

interface ArenaMessage {
  _id: string;
  channelId: string;
  userId: string;
  username: string;
  content: string;
  type: 'text' | 'system';
  replyToId?: string;
  mentions: string[];
  timestamp: string;
  isEdited: boolean;
  editedAt?: string;
  isDeleted: boolean;
  deletedAt?: string;
  deletedBy?: string;
}

interface ApiResponse {
  messages: ArenaMessage[];
  page: number;
  limit: number;
  total: number;
}

const emptyForm: Partial<ArenaMessage> = {
  channelId: '',
  userId: '',
  username: '',
  content: '',
  type: 'text',
  mentions: [],
  timestamp: '',
};

const MessagesPage: React.FC = () => {
  const [messages, setMessages] = useState<ArenaMessage[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<Partial<ArenaMessage>>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);

  // TEMP: Replace with real user context/auth
  const currentUserId = 'admin-user-id'; // TODO: Replace with real current user ID
  const [userRoles, setUserRoles] = useState<{ userId: string; role: string }[]>([]);

  useEffect(() => {
    // Fetch user roles for permission check
    fetch('http://localhost:3001/api/dev-admin/user-roles?page=1&limit=1000')
      .then(res => res.json())
      .then(data => setUserRoles(data.data.roles || []));
  }, []);

  const isAdminOrMod = userRoles.some(r => r.userId === currentUserId && (r.role === 'admin' || r.role === 'moderator'));

  const [banModal, setBanModal] = useState<{ open: boolean; msg: ArenaMessage | null }>({ open: false, msg: null });
  const [banDuration, setBanDuration] = useState<number>(1);
  const [actionLoading, setActionLoading] = useState(false);

  const handleKick = async (msg: ArenaMessage) => {
    setActionLoading(true);
    try {
      await fetch('http://localhost:3001/api/dev-admin/user-status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: msg.userId, channelId: msg.channelId, isKicked: true }),
      });
      fetchMessages(page);
    } catch (err) {
      alert('Kick failed');
    } finally {
      setActionLoading(false);
    }
  };
  const handleBan = (msg: ArenaMessage) => {
    setBanModal({ open: true, msg });
  };
  const confirmBan = async () => {
    if (!banModal.msg) return;
    setActionLoading(true);
    setBanModal({ open: false, msg: null });
    const banExpiresAt = new Date(Date.now() + banDuration * 24 * 60 * 60 * 1000).toISOString();
    try {
      await fetch('http://localhost:3001/api/dev-admin/user-status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: banModal.msg.userId, channelId: banModal.msg.channelId, isBanned: true, banExpiresAt }),
      });
      fetchMessages(page);
    } catch (err) {
      alert('Ban failed');
    } finally {
      setActionLoading(false);
    }
  };

  const fetchMessages = async (pageNum = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `http://localhost:3001/api/dev-admin/messages?page=${pageNum}&limit=${limit}`
      );
      if (!res.ok) throw new Error('Failed to fetch messages');
      const data = await res.json();
      setMessages(data.data.messages);
      setPage(data.data.page);
      setTotal(data.data.total);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      const res = await fetch(
        `http://localhost:3001/api/dev-admin/messages/${id}`,
        { method: 'DELETE' }
      );
      if (!res.ok) throw new Error('Failed to delete message');
      fetchMessages(page);
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

  const openEditModal = (msg: ArenaMessage) => {
    setForm({ ...msg, timestamp: msg.timestamp.slice(0, 19) }); // ISO string for input
    setEditId(msg._id);
    setFormError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setForm(emptyForm);
    setEditId(null);
    setFormError(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    // Basic validation
    if (!form.channelId || !form.userId || !form.username || !form.content || !form.type || !form.timestamp) {
      setFormError('All fields are required.');
      return;
    }
    try {
      const method = editId ? 'PUT' : 'POST';
      const url = editId
        ? `http://localhost:3001/api/dev-admin/messages/${editId}`
        : 'http://localhost:3001/api/dev-admin/messages';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, mentions: form.mentions || [], timestamp: new Date(form.timestamp as string).toISOString() }),
      });
      if (!res.ok) throw new Error('Failed to save message');
      closeModal();
      fetchMessages(page);
    } catch (err: any) {
      setFormError(err.message || 'Save failed');
    }
  };

  const handleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((mid) => mid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selected.length === messages.length) {
      setSelected([]);
    } else {
      setSelected(messages.map((m) => m._id));
    }
  };

  const handleBulkDelete = async () => {
    if (selected.length === 0) return;
    if (!window.confirm(`Delete ${selected.length} selected messages?`)) return;
    try {
      const res = await fetch('http://localhost:3001/api/dev-admin/messages/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selected }),
      });
      if (!res.ok) throw new Error('Failed to bulk delete messages');
      setSelected([]);
      fetchMessages(page);
    } catch (err: any) {
      alert(err.message || 'Bulk delete failed');
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Arena Messages</h1>
      <div className="flex items-center gap-2 mb-4">
        <button
          className="mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={openCreateModal}
        >
          New Message
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
                    checked={selected.length === messages.length && messages.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-2 py-1 border">Username</th>
                <th className="px-2 py-1 border">Content</th>
                <th className="px-2 py-1 border">Channel ID</th>
                <th className="px-2 py-1 border">Timestamp</th>
                <th className="px-2 py-1 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((msg) => (
                <tr key={msg._id}>
                  <td className="px-2 py-1 border text-center">
                    <input
                      type="checkbox"
                      checked={selected.includes(msg._id)}
                      onChange={() => handleSelect(msg._id)}
                    />
                  </td>
                  <td className="px-2 py-1 border">{msg.username}</td>
                  <td className="px-2 py-1 border max-w-xs truncate">{msg.content}</td>
                  <td className="px-2 py-1 border">{msg.channelId}</td>
                  <td className="px-2 py-1 border">{new Date(msg.timestamp).toLocaleString()}</td>
                  <td className="px-2 py-1 border flex gap-2">
                    <button
                      className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                      onClick={() => openEditModal(msg)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                      onClick={() => handleDelete(msg._id)}
                    >
                      Delete
                    </button>
                    <button
                      className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                      onClick={() => handleKick(msg)}
                      disabled={actionLoading}
                    >
                      Kick
                    </button>
                    <button
                      className="bg-orange-500 text-white px-2 py-1 rounded hover:bg-orange-600"
                      onClick={() => handleBan(msg)}
                      disabled={actionLoading}
                    >
                      Ban
                    </button>
                  </td>
                </tr>
              ))}
              {messages.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-4">No messages found.</td>
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
            <h2 className="text-xl font-bold mb-4">{editId ? 'Edit Message' : 'New Message'}</h2>
            {formError && <div className="text-red-500 mb-2">{formError}</div>}
            <form onSubmit={handleFormSubmit} className="space-y-3">
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
                <label className="block text-sm font-medium">Content</label>
                <textarea
                  name="content"
                  value={form.content || ''}
                  onChange={handleFormChange}
                  className="w-full border rounded px-2 py-1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Type</label>
                <select
                  name="type"
                  value={form.type || 'text'}
                  onChange={handleFormChange}
                  className="w-full border rounded px-2 py-1"
                  required
                >
                  <option value="text">Text</option>
                  <option value="system">System</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Timestamp</label>
                <input
                  type="datetime-local"
                  name="timestamp"
                  value={form.timestamp || ''}
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
      {banModal.open && banModal.msg && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-xs relative">
            <h2 className="text-lg font-bold mb-4">Ban User</h2>
            <div className="mb-4">Select ban duration:</div>
            <div className="flex gap-2 mb-4">
              {[1, 3, 7].map(d => (
                <button key={d} className={`px-3 py-1 rounded ${banDuration === d ? 'bg-blue-600 text-white' : 'bg-gray-200'}`} onClick={() => setBanDuration(d)}>{d}d</button>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 bg-gray-200 rounded" onClick={() => setBanModal({ open: false, msg: null })}>Cancel</button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={confirmBan} disabled={actionLoading}>Ban</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesPage; 