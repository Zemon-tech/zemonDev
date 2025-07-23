import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import BanModal from './BanModal';

interface User {
  _id: string;
  username: string;
  email: string;
  clerkId: string;
}

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalUser, setModalUser] = useState<any>(null);

  useEffect(() => {
    const fetchUsers = async (page: number) => {
      try {
        setLoading(true);
        setError(null);

        const token = await getToken();
        if (!token) {
          throw new Error('Not authenticated');
        }

        const response = await fetch(`/api/admin/users?page=${page}&limit=20`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch users: ${response.statusText}`);
        }

        const data = await response.json();
        setUsers(data.data);
        setTotalPages(data.pagination.totalPages);
        setTotalUsers(data.pagination.totalUsers);
        setCurrentPage(data.pagination.currentPage);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers(currentPage);
  }, [getToken, currentPage]);

  if (loading) {
    return <div className="p-6 text-center">Loading users...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-error">Error: {error}</div>;
  }

  return (
    <div className="overflow-x-auto p-4">
      <table className="table w-full">
        {/* head */}
        <thead>
          <tr>
            <th></th>
            <th>Username</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={user._id}>
              <th>{(currentPage - 1) * 20 + index + 1}</th>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>
                <button className="btn btn-sm btn-warning" onClick={() => { setModalUser(user); setModalOpen(true); }}>Ban</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-between items-center p-4">
        <div>
          <p className="text-sm text-base-content/70">
            Page {currentPage} of {totalPages} (Total: {totalUsers} users)
          </p>
        </div>
        <div className="btn-group">
          <button 
            className="btn" 
            onClick={() => setCurrentPage(prev => prev - 1)} 
            disabled={currentPage <= 1}
          >
            «
          </button>
          <button className="btn">Page {currentPage}</button>
          <button 
            className="btn" 
            onClick={() => setCurrentPage(prev => prev + 1)} 
            disabled={currentPage >= totalPages}
          >
            »
          </button>
        </div>
      </div>
      <BanModal open={modalOpen} onClose={() => setModalOpen(false)} user={modalUser} />
    </div>
  );
};

export default UserList;
