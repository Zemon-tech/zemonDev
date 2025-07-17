import React, { useEffect, useState } from 'react';

interface UserChannelStatus {
  _id: string;
  userId: string;
  channelId: string;
  isBanned?: boolean;
  isKicked?: boolean;
  createdAt: string;
  status: 'pending' | 'approved' | 'denied';
}

interface User {
  _id: string;
  username: string;
  fullName: string;
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
  isKicked: false,
  status: 'pending',
};

const UserStatusPage: React.FC = () => {
  const [status, setStatus] = useState<UserChannelStatus[]>([]);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<Partial<UserChannelStatus>>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  // Add state for expanded/collapsed details per user
  const [expandedUsers, setExpandedUsers] = useState<Record<string, boolean>>({});
  const toggleExpand = (userId: string) => {
    setExpandedUsers(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

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
      
      // Fetch user details for all unique user IDs
      const userIds: string[] = Array.from(new Set(data.data.status.map((s: UserChannelStatus) => s.userId)));
      const userPromises = userIds.map(async (userId: string) => {
        try {
          const userRes = await fetch(`http://localhost:3001/api/dev-admin/users?page=1&limit=1000`);
          if (userRes.ok) {
            const userData = await userRes.json();
            const user = userData.data.users.find((u: User) => u._id === userId);
            return user ? { [userId]: user } : {};
          }
        } catch (error) {
          console.warn(`Failed to fetch user ${userId}:`, error);
        }
        return {};
      });
      
      const userResults = await Promise.all(userPromises);
      const userMap = userResults.reduce((acc, userObj) => ({ ...acc, ...userObj }), {});
      setUsers(userMap);
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
      isKicked: status.isKicked || false,
      status: status.status,
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

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let fieldValue: any = value;
    if (type === 'checkbox' && e.target instanceof HTMLInputElement) {
      fieldValue = e.target.checked;
    }
    setForm((f) => ({
      ...f,
      [name]: fieldValue,
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

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`http://localhost:3001/api/dev-admin/user-status/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      });
      if (!res.ok) throw new Error('Failed to approve request');
      fetchStatus(page);
    } catch (err: any) {
      alert(err.message || 'Approve failed');
    } finally {
      setActionLoading(null);
    }
  };
  const handleDeny = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`http://localhost:3001/api/dev-admin/user-status/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'denied' }),
      });
      if (!res.ok) throw new Error('Failed to deny request');
      fetchStatus(page);
    } catch (err: any) {
      alert(err.message || 'Deny failed');
    } finally {
      setActionLoading(null);
    }
  };
  const pendingRequests = status.filter(s => s.status === 'pending');
  
  // Group pending requests by user and count them
  const pendingByUser = pendingRequests.reduce((acc, req) => {
    const userId = req.userId;
    if (!acc[userId]) {
      acc[userId] = {
        user: users[userId] || { _id: userId, username: 'Unknown User', fullName: 'Unknown User' },
        requests: []
      };
    }
    acc[userId].requests.push(req);
    return acc;
  }, {} as Record<string, { user: User; requests: UserChannelStatus[] }>);

  const usersWithPending = Object.entries(pendingByUser).map(([userId, { user, requests }]) => ({
    userId,
    username: user.username || user.fullName,
    pendingCount: requests.length,
    requestIds: requests.map(r => r._id),
  }));

  const handleApproveAll = async (userId: string, requestIds: string[]) => {
    setActionLoading(userId);
    try {
      await Promise.all(requestIds.map(id =>
        fetch(`http://localhost:3001/api/dev-admin/user-status/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'approved' }),
        })
      ));
      fetchStatus(page);
    } catch (err: any) {
      alert(err.message || 'Approve failed');
    } finally {
      setActionLoading(null);
    }
  };
  const handleDenyAll = async (userId: string, requestIds: string[]) => {
    setActionLoading(userId);
    try {
      await Promise.all(requestIds.map(id =>
        fetch(`http://localhost:3001/api/dev-admin/user-status/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'denied' }),
        })
      ));
      fetchStatus(page);
    } catch (err: any) {
      alert(err.message || 'Deny failed');
    } finally {
      setActionLoading(null);
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
          {usersWithPending.length > 0 && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
              <h2 className="text-lg font-semibold mb-2 text-yellow-800">Pending Join Requests (User Level)</h2>
              <table className="min-w-full bg-white border border-gray-200 mb-2">
                <thead>
                  <tr>
                    <th className="px-2 py-1 border">User Name</th>
                    <th className="px-2 py-1 border">Pending Requests</th>
                    <th className="px-2 py-1 border">Actions</th>
                    <th className="px-2 py-1 border">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {usersWithPending.map(user => (
                    <React.Fragment key={user.userId}>
                      <tr>
                        <td className="px-2 py-1 border font-semibold align-top">{user.username}</td>
                        <td className="px-2 py-1 border text-center align-top">{user.pendingCount}</td>
                        <td className="px-2 py-1 border flex gap-2 align-top">
                          <button
                            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 disabled:opacity-50 font-bold"
                            onClick={() => handleApproveAll(user.userId, user.requestIds)}
                            disabled={actionLoading === user.userId}
                          >
                            {actionLoading === user.userId ? 'Approving...' : 'Approve All'}
                          </button>
                          <button
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 disabled:opacity-50 font-bold"
                            onClick={() => handleDenyAll(user.userId, user.requestIds)}
                            disabled={actionLoading === user.userId}
                          >
                            {actionLoading === user.userId ? 'Denying...' : 'Deny All'}
                          </button>
                        </td>
                        <td className="px-2 py-1 border text-center align-top">
                          <button
                            className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-xs font-semibold"
                            onClick={() => toggleExpand(user.userId)}
                          >
                            {expandedUsers[user.userId] ? 'Hide' : 'Show'}
                          </button>
                        </td>
                      </tr>
                      {/* Collapsible sub-table for this user's pending requests */}
                      {expandedUsers[user.userId] && (
                        <tr>
                          <td colSpan={4} className="px-2 py-1 border bg-gray-50">
                            <table className="min-w-full text-xs">
                              <thead>
                                <tr>
                                  <th className="px-2 py-1 border">Channel ID</th>
                                  <th className="px-2 py-1 border">Banned</th>
                                  <th className="px-2 py-1 border">Kicked</th>
                                  <th className="px-2 py-1 border">Status</th>
                                  <th className="px-2 py-1 border">Created At</th>
                                </tr>
                              </thead>
                              <tbody>
                                {pendingByUser[user.userId]?.requests.map(req => (
                                  <tr key={req._id}>
                                    <td className="px-2 py-1 border">{req.channelId}</td>
                                    <td className="px-2 py-1 border text-center">{req.isBanned ? 'Yes' : 'No'}</td>
                                    <td className="px-2 py-1 border text-center">{req.isKicked ? 'Yes' : 'No'}</td>
                                    <td className="px-2 py-1 border text-center">{req.status}</td>
                                    <td className="px-2 py-1 border">{new Date(req.createdAt).toLocaleString()}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
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
                  <div className="flex items-center gap-4 mt-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="isBanned"
                        checked={!!form.isBanned}
                        onChange={handleFormChange}
                        className="mr-2"
                      />
                      Banned
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="isKicked"
                        checked={!!form.isKicked}
                        onChange={handleFormChange}
                        className="mr-2"
                      />
                      Kicked
                    </label>
                  </div>
                  <div className="mb-2">
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <select
                      name="status"
                      value={form.status || 'pending'}
                      onChange={handleFormChange}
                      className="w-full border rounded px-2 py-1"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="denied">Denied</option>
                    </select>
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
        </>
      )}
    </div>
  );
};

export default UserStatusPage; 