import React, { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';

interface ParentChannel {
  id: string;
  name: string;
}

interface UnbanModalProps {
  open: boolean;
  onClose: () => void;
  user: { _id: string; username: string } | null;
  parentChannels: ParentChannel[];
}

const UnbanModal: React.FC<UnbanModalProps> = ({ open, onClose, user, parentChannels }) => {
  const [parentChannel, setParentChannel] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { getToken } = useAuth();

  const handleConfirm = async (e: React.MouseEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!user || !parentChannel) {
      setError('Please select a parent channel to unban from.');
      return;
    }
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`/api/arena/channels/${parentChannel}/unban`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user._id,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.message || 'Failed to unban user.');
      } else {
        setSuccess('User unbanned successfully.');
        setTimeout(() => {
          setSuccess(null);
          onClose();
        }, 1000);
      }
    } catch (err) {
      setError('Failed to unban user.');
    } finally {
      setLoading(false);
    }
  };

  if (!open || !user) return null;

  return (
    <div className="modal modal-open flex items-center justify-center min-h-screen" style={{marginTop: '32px', marginBottom: '32px'}}>
      <div className="modal-box bg-base-200 text-base-content max-w-lg w-full">
        <h3 className="font-bold text-2xl mb-8 text-center">Unban {user.username}</h3>
        <form className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <label className="w-40 text-base font-semibold">User</label>
            <span className="flex-1 text-base-content/80">{user.username}</span>
          </div>
          <div className="flex items-center gap-4">
            <label className="w-40 text-base font-semibold">Parent Channel</label>
            <select className="select select-bordered bg-base-300 flex-1" value={parentChannel} onChange={e => setParentChannel(e.target.value)}>
              <option value="" disabled>Select channel</option>
              {parentChannels.map(ch => (
                <option key={ch.id} value={ch.id}>{ch.name}</option>
              ))}
            </select>
          </div>
          {error && <div className="text-error text-sm text-center mt-2">{error}</div>}
          {success && <div className="text-success text-sm text-center mt-2">{success}</div>}
        </form>
        <div className="modal-action mt-10 flex gap-3 justify-center">
          <button className="btn btn-primary min-w-[120px]" onClick={handleConfirm} disabled={loading}>
            {loading ? 'Processing...' : 'Confirm Unban'}
          </button>
          <button className="btn btn-ghost min-w-[100px]" onClick={onClose} disabled={loading}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default UnbanModal; 