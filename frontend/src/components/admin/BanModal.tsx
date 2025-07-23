import React, { useState } from 'react';

const MOCK_PARENT_CHANNELS = [
  { id: 'parent1', name: 'General' },
  { id: 'parent2', name: 'Development' },
  { id: 'parent3', name: 'Design' },
];

const MOCK_ADMIN = { username: 'adminUser' };

interface BanModalProps {
  open: boolean;
  onClose: () => void;
  user: { username: string } | null;
}

const BanModal: React.FC<BanModalProps> = ({ open, onClose, user }) => {
  const [parentChannel, setParentChannel] = useState('');
  const [duration, setDuration] = useState('1');
  const [reason, setReason] = useState('');

  if (!open || !user) return null;

  return (
    <div className="modal modal-open flex items-center justify-center min-h-screen" style={{marginTop: '32px', marginBottom: '32px'}}>
      <div className="modal-box bg-base-200 text-base-content max-w-lg w-full">
        <h3 className="font-bold text-2xl mb-8 text-center">Ban {user.username}</h3>
        <form className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <label className="w-40 text-base font-semibold">User</label>
            <span className="flex-1 text-base-content/80">{user.username}</span>
          </div>
          <div className="flex items-center gap-4">
            <label className="w-40 text-base font-semibold">Parent Channel</label>
            <select className="select select-bordered bg-base-300 flex-1" value={parentChannel} onChange={e => setParentChannel(e.target.value)}>
              <option value="" disabled>Select channel</option>
              {MOCK_PARENT_CHANNELS.map(ch => (
                <option key={ch.id} value={ch.id}>{ch.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-4">
            <label className="w-40 text-base font-semibold">Ban Duration</label>
            <select className="select select-bordered bg-base-300 flex-1" value={duration} onChange={e => setDuration(e.target.value)}>
              <option value="1">1 day</option>
              <option value="3">3 days</option>
              <option value="7">7 days</option>
              <option value="kick">Kick (permanent)</option>
            </select>
          </div>
          <div className="flex items-center gap-4">
            <label className="w-40 text-base font-semibold">Reason (optional)</label>
            <textarea className="textarea textarea-bordered bg-base-300 flex-1 min-h-[80px]" value={reason} onChange={e => setReason(e.target.value)} placeholder="Enter reason (optional)" />
          </div>
          <div className="flex items-center gap-4">
            <label className="w-40 text-base font-semibold">Banned by</label>
            <span className="flex-1 text-base-content/80">{MOCK_ADMIN.username}</span>
          </div>
        </form>
        <div className="modal-action mt-10 flex gap-3 justify-center">
          <button className="btn btn-primary min-w-[120px]" onClick={onClose}>Confirm {duration === 'kick' ? 'Kick' : 'Ban'}</button>
          <button className="btn btn-ghost min-w-[100px]" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default BanModal; 