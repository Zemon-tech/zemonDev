import React, { useEffect, useState } from 'react';
import { ApiService } from '@/services/api.service';
import { Button } from '@/components/ui/button';
import { useAuth } from '@clerk/clerk-react';

interface JoinRequest {
  username: string;
  fullName: string;
  requests: { channelId: string; channelName: string }[];
}

const JoinRequestsTable: React.FC = () => {
  const { getToken } = useAuth();
  const [requests, setRequests] = useState<Record<string, JoinRequest>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ApiService.fetchJoinRequests(getToken);
      setRequests(res.data || {});
    } catch (err) {
      setError('Failed to fetch join requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (action: 'accept' | 'reject' | 'accept-all' | 'reject-all', userId: string, channelId?: string) => {
    setActionLoading(`${userId}-${channelId || action}`);
    try {
      let endpoint = '';
      if (action === 'accept') endpoint = `/api/arena/channels/join-requests/${userId}/${channelId}/accept`;
      if (action === 'reject') endpoint = `/api/arena/channels/join-requests/${userId}/${channelId}/reject`;
      if (action === 'accept-all') endpoint = `/api/arena/channels/join-requests/${userId}/accept-all`;
      if (action === 'reject-all') endpoint = `/api/arena/channels/join-requests/${userId}/reject-all`;
      await ApiService.postJoinRequestAction(endpoint, getToken);
      await fetchRequests();
    } catch (err) {
      setError('Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-32">Loading...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!Object.keys(requests).length) return <div className="p-4 text-center">No pending join requests.</div>;

  return (
    <div className="overflow-x-auto p-4">
      <table className="table w-full table-zebra">
        <thead>
          <tr>
            <th>Username</th>
            <th>Channel Name(s)</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(requests).map(([userId, req]) => (
            <tr key={userId}>
              <td className="font-semibold">{req.username}</td>
              <td>
                <div className="flex flex-wrap gap-2">
                  {req.requests.map((ch) => (
                    <div key={ch.channelId} className="flex items-center gap-1 bg-base-200 rounded px-2 py-1">
                      <span>{ch.channelName}</span>
                      <Button size="sm" className="btn btn-success btn-xs ml-1" disabled={actionLoading === `${userId}-${ch.channelId}-accept`} onClick={() => handleAction('accept', userId, ch.channelId)}>Accept</Button>
                      <Button size="sm" className="btn btn-error btn-xs ml-1" disabled={actionLoading === `${userId}-${ch.channelId}-reject`} onClick={() => handleAction('reject', userId, ch.channelId)}>Reject</Button>
                    </div>
                  ))}
                </div>
              </td>
              <td>
                <Button size="sm" className="btn btn-success btn-sm mr-2" disabled={actionLoading === `${userId}-accept-all`} onClick={() => handleAction('accept-all', userId)}>Accept All</Button>
                <Button size="sm" className="btn btn-error btn-sm" disabled={actionLoading === `${userId}-reject-all`} onClick={() => handleAction('reject-all', userId)}>Reject All</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default JoinRequestsTable; 