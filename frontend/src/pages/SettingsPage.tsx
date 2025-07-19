import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Settings, Folder, Users, HelpCircle, LogOut, Link2, Trash2, CheckCircle, AlertTriangle, Sun, Moon, Bell, Bookmark, Edit, Archive, Trash, ChevronDown, ChevronUp, Shield, MessageCircle, Star, Mail, Phone, Github, Plus, X, Eye, Linkedin, Twitter, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher';
import { useUser } from '@clerk/clerk-react';
import clsx from 'clsx';

const SECTIONS = [
  { key: 'profile', label: 'Profile & Account', icon: User },
  { key: 'preferences', label: 'Preferences', icon: Settings },
  { key: 'workspace', label: 'Project & Workspace', icon: Folder },
  { key: 'collab', label: 'Collaboration & Social', icon: Users },
  { key: 'support', label: 'Help & Support', icon: HelpCircle },
];

const tabVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

function SectionSidebar({ active, setActive }: { active: string, setActive: (k: string) => void }) {
  return (
    <aside className="w-64 min-w-[220px] h-full border-r border-base-200 bg-base-100/95 flex flex-col py-8 px-4 shadow-sm">
      <div className="mb-8 text-2xl font-bold tracking-tight">Settings</div>
      <nav className="flex flex-col gap-2">
        {SECTIONS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            className={clsx(
              'flex items-center gap-3 px-4 py-2 rounded-lg text-base font-medium transition-all',
              active === key ? 'bg-primary/90 text-primary-content shadow-lg' : 'hover:bg-primary/10 hover:text-primary text-base-content/80',
              'focus:outline-none focus:ring-2 focus:ring-primary/40'
            )}
            onClick={() => setActive(key)}
          >
            <Icon size={20} />
            {label}
          </button>
        ))}
      </nav>
    </aside>
  );
}

function ProfileAccountSection() {
  const [tab, setTab] = useState<'profile' | 'account'>('profile');
  const { user } = useUser();
  // Editable fields
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState('Aspiring developer. Love to build cool things!');
  const [bioCount, setBioCount] = useState(bio.length);
  const [location, setLocation] = useState('');
  const [about, setAbout] = useState('');
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [twitter, setTwitter] = useState('');
  const [website, setWebsite] = useState('');
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [profileUpdated, setProfileUpdated] = useState<Date | null>(null);
  // Account tab state
  const [email, setEmail] = useState(user?.emailAddresses?.[0]?.emailAddress || '');
  const [phone, setPhone] = useState('+1-234-567-8901');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [sessions] = useState([
    { device: 'MacBook Pro', location: 'Delhi, India', lastActive: '2 min ago', current: true },
    { device: 'iPhone 14', location: 'Delhi, India', lastActive: '1 day ago', current: false },
  ]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  // Profile completion (placeholder logic)
  const profileFields = [fullName, username, bio, location, github, linkedin, twitter, website, about];
  const completion = Math.round((profileFields.filter(Boolean).length / profileFields.length) * 100);

  // Password strength (simple placeholder)
  function calcStrength(pw: string) {
    let s = 0;
    if (pw.length > 7) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  }

  // Save profile (placeholder)
  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setShowToast({ type: 'success', message: 'Profile updated!' });
      setProfileUpdated(new Date());
    }, 1200);
  };

  // Cancel changes (placeholder)
  const handleCancel = () => {
    setFullName(user?.fullName || '');
    setUsername(user?.username || '');
    setBio('Aspiring developer. Love to build cool things!');
    setLocation('');
    setAbout('');
    setGithub('');
    setLinkedin('');
    setTwitter('');
    setWebsite('');
  };

  // Toast auto-hide
  React.useEffect(() => {
    if (showToast) {
      const t = setTimeout(() => setShowToast(null), 2000);
      return () => clearTimeout(t);
    }
  }, [showToast]);

  return (
    <div className="flex flex-col h-full w-full p-6">
      {showToast && (
        <div className={clsx('fixed top-6 right-8 z-50 px-4 py-2 rounded shadow text-white', showToast.type === 'success' ? 'bg-green-500' : 'bg-red-500')}>{showToast.message}</div>
      )}
      <div className="flex gap-4 border-b border-base-200 mb-4">
        <button className={clsx('px-3 py-1 font-semibold text-sm transition-all', tab === 'profile' ? 'border-b-2 border-primary text-primary' : 'text-base-content/70 hover:text-primary')} onClick={() => setTab('profile')}>Profile</button>
        <button className={clsx('px-3 py-1 font-semibold text-sm transition-all', tab === 'account' ? 'border-b-2 border-primary text-primary' : 'text-base-content/70 hover:text-primary')} onClick={() => setTab('account')}>Account</button>
      </div>
      <AnimatePresence mode="wait">
        {tab === 'profile' && (
          <motion.div key="profile" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col gap-6 w-full h-full overflow-y-auto pb-4">
            {/* Profile Completion Meter */}
            <div className="flex items-center gap-3 text-xs text-base-content/70">
              <div className="w-40 h-2 bg-base-200 rounded-full overflow-hidden">
                <div className="h-2 bg-primary rounded-full transition-all" style={{ width: `${completion}%` }} />
              </div>
              <span>{completion}% complete</span>
              <Button size="sm" variant="outline" className="ml-2">Preview Public Profile</Button>
              <Button size="sm" variant="outline" onClick={() => {navigator.clipboard.writeText(window.location.href); setShowToast({type:'success',message:'Profile link copied!'});}}>Copy Link</Button>
            </div>
            {/* Avatar and Editable Fields */}
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center border-2 border-primary/30 shadow-lg transition-transform group-hover:scale-105">
                  <img src={user?.imageUrl || '/avatar.png'} alt="avatar" className="w-20 h-20 rounded-full object-cover border-2 border-white" />
                  <Button size="icon" className="absolute bottom-2 right-2 bg-primary text-primary-content border-none shadow hover:bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity" title="Edit Avatar"><Edit size={18} /></Button>
                </div>
              </div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1 text-base-content/80">Full Name</label>
                  <input value={fullName} onChange={e => setFullName(e.target.value)} className="w-full border border-base-200 rounded px-3 py-2 text-base focus:ring-1 focus:ring-primary/30 transition-all" />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-base-content/80">Username</label>
                  <input value={username} onChange={e => setUsername(e.target.value)} className="w-full border border-base-200 rounded px-3 py-2 text-base focus:ring-1 focus:ring-primary/30 transition-all" />
                </div>
                <div className="md:col-span-2">
                  <label className="block font-semibold mb-1 text-base-content/80">Bio / Headline</label>
                  <textarea value={bio} onChange={e => { setBio(e.target.value); setBioCount(e.target.value.length); }} maxLength={120} className="w-full border border-base-200 rounded px-3 py-2 min-h-[48px] text-base focus:ring-1 focus:ring-primary/30 transition-all" />
                  <div className="text-xs text-base-content/50 text-right mt-1">{bioCount}/120</div>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-base-content/80">Location</label>
                  <input value={location} onChange={e => setLocation(e.target.value)} className="w-full border border-base-200 rounded px-3 py-2 text-base focus:ring-1 focus:ring-primary/30 transition-all" />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-base-content/80">About Me</label>
                  <textarea value={about} onChange={e => setAbout(e.target.value)} maxLength={200} className="w-full border border-base-200 rounded px-3 py-2 min-h-[40px] text-base focus:ring-1 focus:ring-primary/30 transition-all" />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-base-content/80 flex items-center gap-1"><Github size={14}/> GitHub</label>
                  <input value={github} onChange={e => setGithub(e.target.value)} placeholder="https://github.com/username" className="w-full border border-base-200 rounded px-3 py-2 text-base focus:ring-1 focus:ring-primary/30 transition-all" />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-base-content/80 flex items-center gap-1"><Linkedin size={14}/> LinkedIn</label>
                  <input value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/username" className="w-full border border-base-200 rounded px-3 py-2 text-base focus:ring-1 focus:ring-primary/30 transition-all" />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-base-content/80 flex items-center gap-1"><Twitter size={14}/> Twitter</label>
                  <input value={twitter} onChange={e => setTwitter(e.target.value)} placeholder="https://twitter.com/username" className="w-full border border-base-200 rounded px-3 py-2 text-base focus:ring-1 focus:ring-primary/30 transition-all" />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-base-content/80 flex items-center gap-1"><Link2 size={14}/> Website</label>
                  <input value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://yourwebsite.com" className="w-full border border-base-200 rounded px-3 py-2 text-base focus:ring-1 focus:ring-primary/30 transition-all" />
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-content hover:bg-primary/90">{saving ? 'Saving...' : 'Save Changes'}</Button>
              <Button onClick={handleCancel} variant="outline" disabled={saving}>Cancel</Button>
              {profileUpdated && <span className="text-xs text-base-content/60 ml-2">Last updated: {profileUpdated.toLocaleTimeString()}</span>}
            </div>
          </motion.div>
        )}
        {tab === 'account' && (
          <motion.div key="account" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col gap-6 w-full h-full overflow-y-auto pb-4">
            {/* Email & Phone */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 flex items-center gap-2">
                <Mail size={18} className="text-primary" />
                <input value={email} onChange={e => setEmail(e.target.value)} className="border border-base-200 rounded px-3 py-2 text-base w-full max-w-xs focus:ring-1 focus:ring-primary/30 transition-all" />
                <CheckCircle size={16} className="text-green-500 ml-2" />
                <Button size="sm" variant="outline" className="ml-2">Verify</Button>
              </div>
              <div className="flex-1 flex items-center gap-2">
                <Phone size={18} className="text-primary" />
                <input value={phone} onChange={e => setPhone(e.target.value)} className="border border-base-200 rounded px-3 py-2 text-base w-full max-w-xs focus:ring-1 focus:ring-primary/30 transition-all" />
                <AlertTriangle size={16} className="text-yellow-500 ml-2" />
                <Button size="sm" variant="outline" className="ml-2">Verify</Button>
              </div>
            </div>
            {/* Password Management */}
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1">
                <label className="block font-semibold mb-1 text-base-content/80">Change Password</label>
                <div className="relative flex items-center">
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => { setPassword(e.target.value); setPasswordStrength(calcStrength(e.target.value)); }} className="w-full border border-base-200 rounded px-3 py-2 text-base focus:ring-1 focus:ring-primary/30 transition-all" placeholder="New password" />
                  <Button size="icon" variant="ghost" className="absolute right-2" onClick={() => setShowPassword(s => !s)}><Eye size={16} /></Button>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-32 h-2 bg-base-200 rounded-full overflow-hidden">
                    <div className={clsx('h-2 rounded-full transition-all', passwordStrength === 0 ? 'bg-base-200' : passwordStrength < 3 ? 'bg-yellow-400' : 'bg-green-500')} style={{ width: `${passwordStrength * 25}%` }} />
                  </div>
                  <span className="text-xs text-base-content/60">{passwordStrength === 0 ? 'Weak' : passwordStrength < 3 ? 'Medium' : 'Strong'}</span>
                </div>
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <label className="block font-semibold mb-1 text-base-content/80">Active Sessions</label>
                <div className="flex flex-col gap-1">
                  {sessions.map((s, i) => (
                    <div key={i} className={clsx('flex items-center gap-2 px-2 py-1 rounded', s.current ? 'bg-primary/10' : 'bg-base-100 border border-base-200')}>{s.device} <span className="text-xs text-base-content/60">({s.location}, {s.lastActive})</span> {s.current && <span className="text-xs text-primary ml-1">Current</span>} {!s.current && <Button size="sm" variant="outline">Logout</Button>}</div>
                  ))}
                </div>
              </div>
            </div>
            {/* Connected Accounts */}
            <div>
              <div className="font-semibold mb-1">Connected Accounts</div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex items-center gap-2"><Github size={16} /> {true ? 'Unlink' : 'Link'} GitHub</Button>
                <Button variant="outline" className="flex items-center gap-2"><Link2 size={16} /> {false ? 'Unlink' : 'Link'} Google</Button>
              </div>
            </div>
            {/* Security Tips */}
            <div className="bg-base-100 border border-base-200 rounded p-3 flex items-center gap-3 text-xs text-base-content/70">
              <Shield size={16} className="text-primary" /> Use a strong password, enable 2FA, and review your sessions regularly.
            </div>
            {/* Account Actions */}
            <div className="flex gap-2 mt-2">
              <Button variant="outline">Export Data</Button>
              <Button variant="destructive" onClick={() => setShowDeleteModal(true)}>Deactivate / Delete Account</Button>
            </div>
            {/* Delete Modal */}
            {showDeleteModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                <div className="bg-white rounded-lg shadow-xl p-8 max-w-sm w-full">
                  <h2 className="text-lg font-bold mb-2">Delete Account?</h2>
                  <p className="text-base-content/70 mb-4">Are you sure you want to delete your account? This action cannot be undone.</p>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
                    <Button variant="destructive" onClick={() => { setShowDeleteModal(false); setShowToast({type:'success',message:'Account deleted (placeholder)!'}); }}>Delete</Button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PreferencesSection() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [notifications, setNotifications] = useState({ upvotes: true, approvals: true, mentions: true, invites: false });
  return (
    <div className="flex flex-col gap-6 w-full h-full p-6">
      <div className="bg-white/90 rounded-xl shadow border border-base-200 p-5 flex flex-col gap-3">
        <div className="font-semibold text-base-content/90 flex items-center gap-2 text-lg mb-1"><Sun size={18} className="text-primary" /> Theme</div>
        <div className="flex gap-2 mt-1">
          <Button variant={theme === 'light' ? 'default' : 'outline'} onClick={() => setTheme('light')}>Light</Button>
          <Button variant={theme === 'dark' ? 'default' : 'outline'} onClick={() => setTheme('dark')}>Dark</Button>
          <Button variant={theme === 'system' ? 'default' : 'outline'} onClick={() => setTheme('system')}>System</Button>
        </div>
      </div>
      <div className="bg-white/90 rounded-xl shadow border border-base-200 p-5 flex flex-col gap-3">
        <div className="font-semibold text-base-content/90 flex items-center gap-2 text-lg mb-1"><Bell size={18} className="text-primary" /> Notifications</div>
        <div className="flex flex-col gap-2 mt-1">
          <label className="flex items-center gap-2 cursor-pointer hover:bg-primary/5 rounded px-2 py-1 transition-colors">
            <input type="checkbox" checked={notifications.upvotes} onChange={e => setNotifications(n => ({ ...n, upvotes: e.target.checked }))} /> Notify on upvotes
          </label>
          <label className="flex items-center gap-2 cursor-pointer hover:bg-primary/5 rounded px-2 py-1 transition-colors">
            <input type="checkbox" checked={notifications.approvals} onChange={e => setNotifications(n => ({ ...n, approvals: e.target.checked }))} /> Project approvals
          </label>
          <label className="flex items-center gap-2 cursor-pointer hover:bg-primary/5 rounded px-2 py-1 transition-colors">
            <input type="checkbox" checked={notifications.mentions} onChange={e => setNotifications(n => ({ ...n, mentions: e.target.checked }))} /> Mentions in chat
          </label>
          <label className="flex items-center gap-2 cursor-pointer hover:bg-primary/5 rounded px-2 py-1 transition-colors">
            <input type="checkbox" checked={notifications.invites} onChange={e => setNotifications(n => ({ ...n, invites: e.target.checked }))} /> Invite reminders
          </label>
        </div>
      </div>
    </div>
  );
}

function WorkspaceSection() {
  // Placeholder content for projects, bookmarks, channels
  return (
    <div className="flex flex-col gap-6 w-full h-full p-6">
      <div className="bg-white/90 rounded-xl shadow border border-base-200 p-5">
        <div className="font-semibold text-base-content/90 flex items-center gap-2 text-lg mb-2"><Folder size={18} className="text-primary" /> My Projects</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
          {[1,2].map(i => (
            <div key={i} className="bg-base-100 rounded-lg p-4 flex flex-col gap-2 border border-base-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="font-bold text-base-content/90 flex items-center gap-2"><BookOpen size={16} /> Project {i}</div>
              <div className="text-xs text-base-content/60">Views: 123 | Bookmarks: 12</div>
              <div className="flex gap-2 mt-1">
                <Button size="sm" variant="outline"><Edit size={14} /> Edit</Button>
                <Button size="sm" variant="outline"><Archive size={14} /> Archive</Button>
                <Button size="sm" variant="destructive"><Trash size={14} /> Delete</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white/90 rounded-xl shadow border border-base-200 p-5">
        <div className="font-semibold text-base-content/90 flex items-center gap-2 text-lg mb-2"><Bookmark size={18} className="text-primary" /> Bookmarks / Favorites</div>
        <div className="flex flex-col gap-2 mt-1">
          {[1,2,3].map(i => (
            <div key={i} className="flex items-center gap-2 bg-base-100 rounded px-2 py-1 border border-base-200 hover:bg-primary/5 transition-colors">
              <Star size={14} className="text-yellow-400" />
              <span>Bookmarked Item {i}</span>
              <Button size="sm" variant="outline" className="ml-auto"><X size={12} /></Button>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white/90 rounded-xl shadow border border-base-200 p-5">
        <div className="font-semibold text-base-content/90 flex items-center gap-2 text-lg mb-2"><Users size={18} className="text-primary" /> Channel Memberships</div>
        <div className="flex flex-col gap-2 mt-1">
          {[{name:'General',notify:true},{name:'Dev',notify:false}].map((ch,i) => (
            <div key={i} className="flex items-center gap-2 bg-base-100 rounded px-2 py-1 border border-base-200 hover:bg-primary/5 transition-colors">
              <span>{ch.name}</span>
              <label className="flex items-center gap-1 ml-auto">
                <input type="checkbox" checked={ch.notify} readOnly /> Notify
              </label>
              <Button size="sm" variant="outline">Leave</Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CollaborationSection() {
  // Placeholder content for invites, roles, moderation
  return (
    <div className="flex flex-col gap-6 w-full h-full p-6">
      <div className="bg-white/90 rounded-xl shadow border border-base-200 p-5">
        <div className="font-semibold text-base-content/90 flex items-center gap-2 text-lg mb-2"><MessageCircle size={18} className="text-primary" /> Invitations</div>
        <div className="flex flex-col gap-2 mt-1">
          {[{id:1,from:'Alice'},{id:2,from:'Bob'}].map(invite => (
            <div key={invite.id} className="flex items-center gap-2 bg-base-100 rounded px-2 py-1 border border-base-200 hover:bg-primary/5 transition-colors">
              <span>Invite from {invite.from}</span>
              <Button size="sm" variant="outline">Accept</Button>
              <Button size="sm" variant="destructive">Decline</Button>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white/90 rounded-xl shadow border border-base-200 p-5">
        <div className="font-semibold text-base-content/90 flex items-center gap-2 text-lg mb-2"><Shield size={18} className="text-primary" /> Roles & Permissions</div>
        <div className="flex flex-col gap-2 mt-1">
          {[{role:'Member',group:'General'},{role:'Moderator',group:'Dev'}].map((r,i) => (
            <div key={i} className="flex items-center gap-2 bg-base-100 rounded px-2 py-1 border border-base-200">
              <span>{r.role} in {r.group}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white/90 rounded-xl shadow border border-base-200 p-5">
        <div className="font-semibold text-base-content/90 flex items-center gap-2 text-lg mb-2"><AlertTriangle size={18} className="text-primary" /> Moderation Tools</div>
        <div className="flex flex-col gap-2 mt-1">
          <div className="bg-base-100 rounded px-2 py-1 border border-base-200">No flagged content.</div>
        </div>
      </div>
    </div>
  );
}

function SupportSection() {
  return (
    <div className="flex flex-col gap-6 w-full h-full p-6">
      <div className="bg-white/90 rounded-xl shadow border border-base-200 p-5">
        <div className="font-semibold text-base-content/90 flex items-center gap-2 text-lg mb-2"><HelpCircle size={18} className="text-primary" /> FAQ / Help Center</div>
        <div className="flex flex-col gap-2 mt-1">
          <a href="#" className="text-primary hover:underline">How to use the app?</a>
          <a href="#" className="text-primary hover:underline">Account & Security</a>
          <a href="#" className="text-primary hover:underline">Project Management</a>
        </div>
      </div>
      <div className="bg-white/90 rounded-xl shadow border border-base-200 p-5">
        <div className="font-semibold text-base-content/90 flex items-center gap-2 text-lg mb-2"><Mail size={18} className="text-primary" /> Contact Support</div>
        <Button variant="outline">Open Support Chat</Button>
      </div>
      <div className="bg-white/90 rounded-xl shadow border border-base-200 p-5">
        <div className="font-semibold text-base-content/90 flex items-center gap-2 text-lg mb-2"><Star size={18} className="text-primary" /> Feedback</div>
        <textarea className="w-full border border-base-200 rounded px-3 py-2 min-h-[48px] text-base focus:ring-1 focus:ring-primary/30 transition-all" placeholder="Your suggestions or bug reports..." />
        <Button className="mt-2">Submit Feedback</Button>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [active, setActive] = useState('profile');
  return (
    <div className="flex w-full bg-gradient-to-br from-base-100 via-base-50 to-base-200" style={{ height: '95vh', overflow: 'hidden' }}>
      <SectionSidebar active={active} setActive={setActive} />
      <main className="flex-1 flex flex-col h-full w-full" style={{ height: '95vh', overflow: 'hidden' }}>
        <AnimatePresence mode="wait">
          {active === 'profile' && (
            <motion.section key="profile" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }} className="h-full w-full" style={{ height: '90vh', overflow: 'hidden' }}>
              <ProfileAccountSection />
            </motion.section>
          )}
          {active === 'preferences' && (
            <motion.section key="preferences" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }} className="h-full w-full" style={{ height: '90vh', overflow: 'hidden' }}>
              <PreferencesSection />
            </motion.section>
          )}
          {active === 'workspace' && (
            <motion.section key="workspace" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }} className="h-full w-full" style={{ height: '90vh', overflow: 'hidden' }}>
              <WorkspaceSection />
            </motion.section>
          )}
          {active === 'collab' && (
            <motion.section key="collab" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }} className="h-full w-full" style={{ height: '90vh', overflow: 'hidden' }}>
              <CollaborationSection />
            </motion.section>
          )}
          {active === 'support' && (
            <motion.section key="support" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }} className="h-full w-full" style={{ height: '90vh', overflow: 'hidden' }}>
              <SupportSection />
            </motion.section>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
} 