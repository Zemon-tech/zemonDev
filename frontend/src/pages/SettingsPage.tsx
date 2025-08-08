import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Settings, Folder, Users, HelpCircle, Link2, CheckCircle, AlertTriangle, Sun, Bell, Bookmark, Edit, Archive, Trash, Shield, MessageCircle, Star, Mail, Github, X, Eye, Linkedin, Twitter, BookOpen, Plus, Palette, Moon, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser, useAuth } from '@clerk/clerk-react';
import clsx from 'clsx';
import { useUserProfile } from '@/hooks/useUserProfile';
import { updateProfile, changePassword, deleteAccount, exportUserData } from '@/lib/settingsApi';
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher';

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
  const { getToken } = useAuth();
  const { userProfile, loading: profileLoading, refetch: refetchProfile } = useUserProfile();
  
  // Editable fields - initialize with user profile data
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [bioCount, setBioCount] = useState(0);
  const [location, setLocation] = useState('');
  const [about, setAbout] = useState('');
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [twitter, setTwitter] = useState('');
  const [website, setWebsite] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  
  // College details
  const [collegeName, setCollegeName] = useState('');
  const [course, setCourse] = useState('');
  const [branch, setBranch] = useState('');
  const [year, setYear] = useState<number | ''>('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [profileUpdated, setProfileUpdated] = useState<Date | null>(null);
  
  // Account tab state
  const [email, setEmail] = useState(user?.emailAddresses?.[0]?.emailAddress || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Load user profile data when available
  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.fullName || '');
      setUsername(userProfile.username || '');
      setBio(userProfile.profile?.bio || '');
      setBioCount(userProfile.profile?.bio?.length || 0);
      setLocation(userProfile.profile?.location || '');
      setAbout(userProfile.profile?.aboutMe || '');
      setGithub(userProfile.socialLinks?.github || '');
      setLinkedin(userProfile.socialLinks?.linkedin || '');
      setTwitter(userProfile.socialLinks?.twitter || '');
      setWebsite(userProfile.socialLinks?.portfolio || '');
      setSkills(userProfile.profile?.skills || []);
      
      // College details
      setCollegeName(userProfile.college?.collegeName || '');
      setCourse(userProfile.college?.course || '');
      setBranch(userProfile.college?.branch || '');
      setYear(userProfile.college?.year || '');
      setCity(userProfile.college?.city || '');
      setState(userProfile.college?.state || '');
    }
  }, [userProfile]);
  
  // Profile completion calculation
  const profileFields = [fullName, username, bio, location, github, linkedin, twitter, website, about, collegeName, course, branch];
  const completion = Math.round((profileFields.filter(Boolean).length / profileFields.length) * 100);

  // Password strength calculation
  function calcStrength(pw: string) {
    let s = 0;
    if (pw.length > 7) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  }

  // Add skill
  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  // Remove skill
  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  // Save profile to database
  const handleSave = async () => {
    setSaving(true);
    try {
      const profileData = {
        fullName,
        username,
        profile: {
          bio,
          aboutMe: about,
          location,
          skills,
        },
        socialLinks: {
          github,
          linkedin,
          twitter,
          portfolio: website,
        },
        college: {
          collegeName,
          course,
          branch,
          year: year ? Number(year) : undefined,
          city,
          state,
        },
      };

      await updateProfile(profileData, getToken);
      await refetchProfile(); // Refresh profile data
      setShowToast({ type: 'success', message: 'Profile updated successfully!' });
      setProfileUpdated(new Date());
    } catch (error) {
      console.error('Error updating profile:', error);
      setShowToast({ type: 'error', message: error instanceof Error ? error.message : 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  // Cancel changes - reset to original values
  const handleCancel = () => {
    if (userProfile) {
      setFullName(userProfile.fullName || '');
      setUsername(userProfile.username || '');
      setBio(userProfile.profile?.bio || '');
      setBioCount(userProfile.profile?.bio?.length || 0);
      setLocation(userProfile.profile?.location || '');
      setAbout(userProfile.profile?.aboutMe || '');
      setGithub(userProfile.socialLinks?.github || '');
      setLinkedin(userProfile.socialLinks?.linkedin || '');
      setTwitter(userProfile.socialLinks?.twitter || '');
      setWebsite(userProfile.socialLinks?.portfolio || '');
      setSkills(userProfile.profile?.skills || []);
      
      // College details
      setCollegeName(userProfile.college?.collegeName || '');
      setCourse(userProfile.college?.course || '');
      setBranch(userProfile.college?.branch || '');
      setYear(userProfile.college?.year || '');
      setCity(userProfile.college?.city || '');
      setState(userProfile.college?.state || '');
    }
  };

  // Change password
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      setShowToast({ type: 'error', message: 'Please fill in both password fields' });
      return;
    }

    if (newPassword.length < 8) {
      setShowToast({ type: 'error', message: 'New password must be at least 8 characters long' });
      return;
    }

    try {
      await changePassword({ currentPassword, newPassword }, getToken);
      setShowToast({ type: 'success', message: 'Password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setPasswordStrength(0);
    } catch (error) {
      console.error('Error changing password:', error);
      setShowToast({ type: 'error', message: error instanceof Error ? error.message : 'Failed to change password' });
    }
  };

  // Export user data
  const handleExportData = async () => {
    try {
      const data = await exportUserData(getToken);
      const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'user-data.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setShowToast({ type: 'success', message: 'Data exported successfully!' });
    } catch (error) {
      console.error('Error exporting data:', error);
      setShowToast({ type: 'error', message: error instanceof Error ? error.message : 'Failed to export data' });
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    try {
      await deleteAccount(getToken);
      setShowToast({ type: 'success', message: 'Account deleted successfully!' });
      // Note: In a real app, you'd redirect to logout or home page
    } catch (error) {
      console.error('Error deleting account:', error);
      setShowToast({ type: 'error', message: error instanceof Error ? error.message : 'Failed to delete account' });
    }
    setShowDeleteModal(false);
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
          <motion.div key="profile" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col gap-6 w-full h-full pb-4">
            {profileLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-base-content/70">Loading profile...</p>
                </div>
              </div>
            ) : (
              <>
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
                  <label className="font-semibold mb-1 text-base-content/80 flex items-center gap-1"><Github size={14}/> GitHub</label>
                  <input value={github} onChange={e => setGithub(e.target.value)} placeholder="https://github.com/username" className="w-full border border-base-200 rounded px-3 py-2 text-base focus:ring-1 focus:ring-primary/30 transition-all" />
                </div>
                <div>
                  <label className="font-semibold mb-1 text-base-content/80 flex items-center gap-1"><Linkedin size={14}/> LinkedIn</label>
                  <input value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/username" className="w-full border border-base-200 rounded px-3 py-2 text-base focus:ring-1 focus:ring-primary/30 transition-all" />
                </div>
                <div>
                  <label className="font-semibold mb-1 text-base-content/80 flex items-center gap-1"><Twitter size={14}/> Twitter</label>
                  <input value={twitter} onChange={e => setTwitter(e.target.value)} placeholder="https://twitter.com/username" className="w-full border border-base-200 rounded px-3 py-2 text-base focus:ring-1 focus:ring-primary/30 transition-all" />
                </div>
                <div>
                  <label className="font-semibold mb-1 text-base-content/80 flex items-center gap-1"><Link2 size={14}/> Website</label>
                  <input value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://yourwebsite.com" className="w-full border border-base-200 rounded px-3 py-2 text-base focus:ring-1 focus:ring-primary/30 transition-all" />
                </div>
              </div>
            </div>
            
            {/* Skills Management */}
            <div className="bg-base-100 border border-base-200 rounded-lg p-4">
              <h3 className="font-semibold mb-3 text-base-content/90 flex items-center gap-2">
                <BookOpen size={16} className="text-primary" />
                Skills & Technologies
              </h3>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    value={newSkill}
                    onChange={e => setNewSkill(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleAddSkill()}
                    placeholder="Add a skill (e.g., React, Python, UI/UX)"
                    className="flex-1 border border-base-200 rounded px-3 py-2 text-base focus:ring-1 focus:ring-primary/30 transition-all"
                  />
                  <Button onClick={handleAddSkill} disabled={!newSkill.trim()} size="sm" className="bg-primary text-primary-content hover:bg-primary/90">
                    <Plus size={16} />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <div key={index} className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                      <span>{skill}</span>
                      <button
                        onClick={() => handleRemoveSkill(skill)}
                        className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  {skills.length === 0 && (
                    <span className="text-base-content/50 text-sm">No skills added yet</span>
                  )}
                </div>
              </div>
            </div>

            {/* College Details */}
            <div className="bg-base-100 border border-base-200 rounded-lg p-4">
              <h3 className="font-semibold mb-3 text-base-content/90 flex items-center gap-2">
                <User size={16} className="text-primary" />
                College Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1 text-base-content/80">College Name</label>
                  <input value={collegeName} onChange={e => setCollegeName(e.target.value)} className="w-full border border-base-200 rounded px-3 py-2 text-base focus:ring-1 focus:ring-primary/30 transition-all" />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-base-content/80">Course</label>
                  <input value={course} onChange={e => setCourse(e.target.value)} className="w-full border border-base-200 rounded px-3 py-2 text-base focus:ring-1 focus:ring-primary/30 transition-all" />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-base-content/80">Branch</label>
                  <input value={branch} onChange={e => setBranch(e.target.value)} className="w-full border border-base-200 rounded px-3 py-2 text-base focus:ring-1 focus:ring-primary/30 transition-all" />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-base-content/80">Year</label>
                  <input type="number" min="1" max="5" value={year} onChange={e => setYear(e.target.value ? Number(e.target.value) : '')} className="w-full border border-base-200 rounded px-3 py-2 text-base focus:ring-1 focus:ring-primary/30 transition-all" />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-base-content/80">City</label>
                  <input value={city} onChange={e => setCity(e.target.value)} className="w-full border border-base-200 rounded px-3 py-2 text-base focus:ring-1 focus:ring-primary/30 transition-all" />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-base-content/80">State</label>
                  <input value={state} onChange={e => setState(e.target.value)} className="w-full border border-base-200 rounded px-3 py-2 text-base focus:ring-1 focus:ring-primary/30 transition-all" />
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-content hover:bg-primary/90">{saving ? 'Saving...' : 'Save Changes'}</Button>
              <Button onClick={handleCancel} variant="outline" disabled={saving}>Cancel</Button>
              {profileUpdated && <span className="text-xs text-base-content/60 ml-2">Last updated: {profileUpdated.toLocaleTimeString()}</span>}
            </div>
              </>
            )}
          </motion.div>
        )}
        {tab === 'account' && (
          <motion.div key="account" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col gap-6 w-full h-full pb-4">
            {/* Email */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Mail size={18} className="text-primary" />
                <input value={email} onChange={e => setEmail(e.target.value)} className="border border-base-200 rounded px-3 py-2 text-base w-full max-w-xs focus:ring-1 focus:ring-primary/30 transition-all" />
                {user?.emailAddresses?.[0]?.verification?.status === 'verified' ? (
                  <CheckCircle size={16} className="text-green-500 ml-2" />
                ) : (
                  <AlertTriangle size={16} className="text-yellow-500 ml-2" />
                )}
                <Button size="sm" variant="outline" className="ml-2" disabled={user?.emailAddresses?.[0]?.verification?.status === 'verified'}>
                  {user?.emailAddresses?.[0]?.verification?.status === 'verified' ? 'Verified' : 'Verify'}
                </Button>
              </div>
            </div>
            {/* Password Management */}
            <div className="flex flex-col md:flex-row gap-4 items-start">
              <div className="flex-1">
                <label className="block font-semibold mb-1 text-base-content/80">Change Password</label>
                <div className="space-y-3">
                  <input 
                    type="password" 
                    value={currentPassword} 
                    onChange={e => setCurrentPassword(e.target.value)} 
                    className="w-full border border-base-200 rounded px-3 py-2 text-base focus:ring-1 focus:ring-primary/30 transition-all" 
                    placeholder="Current password" 
                  />
                  <div className="relative flex items-center">
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      value={newPassword} 
                      onChange={e => { setNewPassword(e.target.value); setPasswordStrength(calcStrength(e.target.value)); }} 
                      className="w-full border border-base-200 rounded px-3 py-2 text-base focus:ring-1 focus:ring-primary/30 transition-all" 
                      placeholder="New password" 
                    />
                    <Button size="icon" variant="ghost" className="absolute right-2" onClick={() => setShowPassword(s => !s)}><Eye size={16} /></Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-base-200 rounded-full overflow-hidden">
                      <div className={clsx('h-2 rounded-full transition-all', passwordStrength === 0 ? 'bg-base-200' : passwordStrength < 3 ? 'bg-yellow-400' : 'bg-green-500')} style={{ width: `${passwordStrength * 25}%` }} />
                    </div>
                    <span className="text-xs text-base-content/60">{passwordStrength === 0 ? 'Weak' : passwordStrength < 3 ? 'Medium' : 'Strong'}</span>
                  </div>
                  <Button onClick={handleChangePassword} disabled={!currentPassword || !newPassword} className="bg-primary text-primary-content hover:bg-primary/90">
                    Change Password
                  </Button>
                </div>
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <label className="block font-semibold mb-1 text-base-content/80">Active Sessions</label>
                <div className="flex flex-col gap-1">
                  <div className="text-base-content/60 text-sm">Session management coming soon</div>
                </div>
              </div>
            </div>
            {/* Connected Accounts */}
            <div>
              <div className="font-semibold mb-1">Connected Accounts</div>
              <div className="flex gap-3">
                <Button variant="outline" disabled className="flex items-center gap-2 opacity-50 cursor-not-allowed">
                  <Github size={16} /> 
                  <span>GitHub</span>
                  <span className="text-xs bg-base-300 px-2 py-1 rounded ml-2">Coming Soon</span>
                </Button>
                <Button variant="outline" disabled className="flex items-center gap-2 opacity-50 cursor-not-allowed">
                  <Link2 size={16} /> 
                  <span>Google</span>
                  <span className="text-xs bg-base-300 px-2 py-1 rounded ml-2">Coming Soon</span>
                </Button>
              </div>
            </div>
            {/* Security Tips */}
            <div className="bg-base-100 border border-base-200 rounded p-3 flex items-center gap-3 text-xs text-base-content/70">
              <Shield size={16} className="text-primary" /> Use a strong password, enable 2FA, and review your sessions regularly.
            </div>
            {/* Account Actions */}
            <div className="flex gap-2 mt-2">
              <Button variant="outline" onClick={handleExportData}>Export Data</Button>
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
                    <Button variant="destructive" onClick={handleDeleteAccount}>Delete</Button>
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
  const [notifications, setNotifications] = useState({ 
    upvotes: true, 
    approvals: true, 
    mentions: true, 
    invites: false 
  });

  return (
    <div className="flex flex-col gap-8 w-full h-full p-6">
      {/* Theme Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-gradient-to-br from-base-100 to-base-200/50 rounded-2xl shadow-lg border border-base-300/50 backdrop-blur-sm relative z-10"
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
              <Palette className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-base-content">Theme & Appearance</h3>
              <p className="text-base-content/60 text-sm">Customize your visual experience</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-base-200/50 border border-base-300/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Sun className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-base-content">Theme Selection</p>
                  <p className="text-sm text-base-content/60">Choose from our curated collection of themes</p>
                </div>
              </div>
              <ThemeSwitcher />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Notifications Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-gradient-to-br from-base-100 to-base-200/50 rounded-2xl shadow-lg border border-base-300/50 backdrop-blur-sm relative z-0"
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-secondary/20 to-secondary/10 border border-secondary/20">
              <Bell className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-base-content">Notifications</h3>
              <p className="text-base-content/60 text-sm">Manage your notification preferences</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {[
              { key: 'upvotes', label: 'Upvotes & Reactions', description: 'Get notified when someone upvotes your content' },
              { key: 'approvals', label: 'Project Approvals', description: 'Notifications for project approval status' },
              { key: 'mentions', label: 'Mentions & Comments', description: 'When someone mentions you in discussions' },
              { key: 'invites', label: 'Invite Reminders', description: 'Reminders for pending invitations' }
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-4 rounded-xl bg-base-200/50 border border-base-300/50 hover:bg-base-200/70 transition-colors">
                <div className="flex-1">
                  <p className="font-medium text-base-content">{item.label}</p>
                  <p className="text-sm text-base-content/60">{item.description}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications[item.key as keyof typeof notifications]}
                    onChange={(e) => setNotifications(prev => ({ ...prev, [item.key]: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-base-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Additional Preferences */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-gradient-to-br from-base-100 to-base-200/50 rounded-2xl shadow-lg border border-base-300/50 backdrop-blur-sm relative z-0"
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 border border-accent/20">
              <Settings className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-base-content">Additional Preferences</h3>
              <p className="text-base-content/60 text-sm">Fine-tune your experience</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-base-200/50 border border-base-300/50">
              <h4 className="font-medium text-base-content mb-2">Auto-save</h4>
              <p className="text-sm text-base-content/60 mb-3">Automatically save your work</p>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-base-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            
            <div className="p-4 rounded-xl bg-base-200/50 border border-base-300/50">
              <h4 className="font-medium text-base-content mb-2">Keyboard Shortcuts</h4>
              <p className="text-sm text-base-content/60 mb-3">Enable keyboard shortcuts</p>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-base-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>
      </motion.div>
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
    <div className="h-full w-full bg-gradient-to-br from-base-100 via-base-50 to-base-200 flex relative overflow-hidden">
      <SectionSidebar active={active} setActive={setActive} />
      <main className="flex-1 flex flex-col h-full w-full overflow-hidden">
        <AnimatePresence mode="wait">
          {active === 'profile' && (
            <motion.section 
              key="profile" 
              initial={{ opacity: 0, x: 40 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -40 }} 
              transition={{ duration: 0.3 }} 
              className="h-full w-full overflow-hidden"
            >
              <div className="h-full overflow-y-auto">
                <ProfileAccountSection />
              </div>
            </motion.section>
          )}
          {active === 'preferences' && (
            <motion.section 
              key="preferences" 
              initial={{ opacity: 0, x: 40 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -40 }} 
              transition={{ duration: 0.3 }} 
              className="h-full w-full overflow-hidden"
            >
              <div className="h-full overflow-y-auto">
                <PreferencesSection />
              </div>
            </motion.section>
          )}
          {active === 'workspace' && (
            <motion.section 
              key="workspace" 
              initial={{ opacity: 0, x: 40 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -40 }} 
              transition={{ duration: 0.3 }} 
              className="h-full w-full overflow-hidden"
            >
              <div className="h-full overflow-y-auto">
                <WorkspaceSection />
              </div>
            </motion.section>
          )}
          {active === 'collab' && (
            <motion.section 
              key="collab" 
              initial={{ opacity: 0, x: 40 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -40 }} 
              transition={{ duration: 0.3 }} 
              className="h-full w-full overflow-hidden"
            >
              <div className="h-full overflow-y-auto">
                <CollaborationSection />
              </div>
            </motion.section>
          )}
          {active === 'support' && (
            <motion.section 
              key="support" 
              initial={{ opacity: 0, x: 40 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -40 }} 
              transition={{ duration: 0.3 }} 
              className="h-full w-full overflow-hidden"
            >
              <div className="h-full overflow-y-auto">
                <SupportSection />
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
} 