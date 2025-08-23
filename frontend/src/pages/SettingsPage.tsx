import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Settings, Folder, Users, HelpCircle, Link2, CheckCircle, AlertTriangle, Sun, Bell, Bookmark, Edit, Archive, Trash, Shield, Star, Mail, Github, X, Eye, Linkedin, Twitter, BookOpen, Plus, Palette, ExternalLink, LogOut, Lock, Unlock, TrendingUp, TrendingDown, Trophy, Brain, School, RefreshCw, MessageCircle, Award, Target, MapPin, Globe, Lightbulb, Zap, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser, useAuth } from '@clerk/clerk-react';
import clsx from 'clsx';
import { useUserProfile } from '@/hooks/useUserProfile';
import { updateProfile, changePassword, deleteAccount, exportUserData } from '@/lib/settingsApi';
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher';
import { CustomToggle } from '@/components/ui/CustomToggle';
import { useUserProjects } from '@/hooks/useUserProjects';
import { useWorkspaceSettings } from '@/hooks/useWorkspaceSettings';
import { ProjectSubmissionModal } from '@/components/settings/ProjectSubmissionModal';
import { useArenaChannels } from '@/hooks/useArenaChannels';
import { useUserRole } from '@/context/UserRoleContext';
import { RolesAndPermissionsCard } from '@/components/settings/RolesAndPermissionsCard';
import { ApiService } from '@/services/api.service';

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
    <aside className="w-64 min-w-[220px] h-full border-r border-base-200/60 bg-gradient-to-b from-base-100/95 to-base-50/90 backdrop-blur-sm flex flex-col py-8 px-4 shadow-lg">
      <div className="mb-8 text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Settings</div>
      <nav className="flex flex-col gap-3">
        {SECTIONS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            className={clsx(
              'flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 group',
              active === key 
                ? 'bg-gradient-to-r from-primary/90 to-primary/70 text-primary-content shadow-lg shadow-primary/25 scale-105' 
                : 'hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:text-primary text-base-content/80 hover:scale-102',
              'focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 focus:ring-offset-base-100'
            )}
            onClick={() => setActive(key)}
          >
            <Icon size={20} className={clsx(
              'transition-transform duration-200',
              active === key ? 'scale-110' : 'group-hover:scale-110'
            )} />
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
  const { getToken, signOut } = useAuth();
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
  
  // Enhanced skills management
  const [skillProgress, setSkillProgress] = useState<Array<{
    skill: string;
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    progress: number;
  }>>([]);
  const [newSkillProgress, setNewSkillProgress] = useState({
    skill: '',
    level: 'beginner' as const,
    progress: 0
  });
  
  // Achievements management
  const [badges, setBadges] = useState<Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    category: 'crucible' | 'forge' | 'arena' | 'streak' | 'special';
    metadata?: Record<string, any>;
  }>>([]);
  const [newBadge, setNewBadge] = useState({
    name: '',
    description: '',
    icon: '🏆',
    category: 'special' as const
  });
  
  const [certificates, setCertificates] = useState<Array<{
    id: string;
    name: string;
    issuer: string;
    issueDate: string;
    expiryDate?: string;
    credentialUrl?: string;
    category: 'technical' | 'academic' | 'professional' | 'platform';
  }>>([]);
  const [newCertificate, setNewCertificate] = useState({
    name: '',
    issuer: '',
    issueDate: '',
    expiryDate: '',
    credentialUrl: '',
    category: 'technical' as const
  });
  
  const [milestones, setMilestones] = useState<Array<{
    id: string;
    name: string;
    description: string;
    category: 'problems' | 'resources' | 'collaboration' | 'streak';
    value: number;
  }>>([]);
  const [newMilestone, setNewMilestone] = useState({
    name: '',
    description: '',
    category: 'problems' as const,
    value: 0
  });

  // Profile visibility settings
  const [profileVisibility, setProfileVisibility] = useState({
    isPublic: true,
    showEmail: false,
    showStats: true,
    showAchievements: true,
    showSkills: true,
    showSocialLinks: true,
    showCollegeDetails: true,
  });
  
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
      
      // Enhanced skills
      setSkillProgress(userProfile.profile?.skillProgress || []);
      
      // Achievements
      setBadges(userProfile.achievements?.badges || []);
      setCertificates(userProfile.achievements?.certificates || []);
      setMilestones(userProfile.achievements?.milestones || []);
      
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
  const achievementFields = [badges.length > 0, certificates.length > 0, milestones.length > 0, skillProgress.length > 0];
  const completion = Math.round(((profileFields.filter(Boolean).length + achievementFields.filter(Boolean).length) / (profileFields.length + achievementFields.length)) * 100);

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

  // Add skill progress
  const handleAddSkillProgress = () => {
    if (newSkillProgress.skill.trim() && !skillProgress.find(sp => sp.skill === newSkillProgress.skill.trim())) {
      setSkillProgress([...skillProgress, { ...newSkillProgress, skill: newSkillProgress.skill.trim() }]);
      setNewSkillProgress({ skill: '', level: 'beginner', progress: 0 });
    }
  };

  // Remove skill progress
  const handleRemoveSkillProgress = (skillToRemove: string) => {
    setSkillProgress(skillProgress.filter(sp => sp.skill !== skillToRemove));
  };

  // Update skill progress
  const handleUpdateSkillProgress = (skill: string, field: 'level' | 'progress', value: any) => {
    setSkillProgress(skillProgress.map(sp => 
      sp.skill === skill ? { ...sp, [field]: value, lastUpdated: new Date() } : sp
    ));
  };

  // Add badge
  const handleAddBadge = () => {
    if (newBadge.name.trim() && newBadge.description.trim()) {
      const badge = {
        id: `badge-${Date.now()}`,
        ...newBadge,
        name: newBadge.name.trim(),
        description: newBadge.description.trim()
      };
      setBadges([...badges, badge]);
      setNewBadge({ name: '', description: '', icon: '🏆', category: 'special' });
    }
  };

  // Remove badge
  const handleRemoveBadge = (badgeId: string) => {
    setBadges(badges.filter(badge => badge.id !== badgeId));
  };

  // Add certificate
  const handleAddCertificate = () => {
    if (newCertificate.name.trim() && newCertificate.issuer.trim() && newCertificate.issueDate) {
      const certificate = {
        id: `cert-${Date.now()}`,
        ...newCertificate,
        name: newCertificate.name.trim(),
        issuer: newCertificate.issuer.trim()
      };
      setCertificates([...certificates, certificate]);
      setNewCertificate({ name: '', issuer: '', issueDate: '', expiryDate: '', credentialUrl: '', category: 'technical' });
    }
  };

  // Remove certificate
  const handleRemoveCertificate = (certId: string) => {
    setCertificates(certificates.filter(cert => cert.id !== certId));
  };

  // Add milestone
  const handleAddMilestone = () => {
    if (newMilestone.name.trim() && newMilestone.description.trim()) {
      const milestone = {
        id: `milestone-${Date.now()}`,
        ...newMilestone,
        name: newMilestone.name.trim(),
        description: newMilestone.description.trim()
      };
      setMilestones([...milestones, milestone]);
      setNewMilestone({ name: '', description: '', category: 'problems', value: 0 });
    }
  };

  // Remove milestone
  const handleRemoveMilestone = (milestoneId: string) => {
    setMilestones(milestones.filter(milestone => milestone.id !== milestoneId));
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
          skillProgress,
        },
        achievements: {
          badges,
          certificates,
          milestones,
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

  // Save profile visibility settings
  const handleSaveVisibility = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/users/me/visibility`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ profileVisibility }),
      });
      
      if (response.ok) {
        setShowToast({ type: 'success', message: 'Profile visibility updated successfully!' });
        console.log('Profile visibility updated successfully');
      } else {
        setShowToast({ type: 'error', message: 'Failed to update profile visibility' });
        console.error('Failed to update profile visibility');
      }
    } catch (error) {
      console.error('Error updating profile visibility:', error);
      setShowToast({ type: 'error', message: 'Failed to update profile visibility' });
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
      
      // Enhanced skills
      setSkillProgress(userProfile.profile?.skillProgress || []);
      
      // Achievements
      setBadges(userProfile.achievements?.badges || []);
      setCertificates(userProfile.achievements?.certificates || []);
      setMilestones(userProfile.achievements?.milestones || []);
      
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

  // Logout handler
  const handleLogout = async () => {
    const getLandingRedirectUrl = () => {
      try {
        // Use environment variable for landing URL
        const landingUrl = import.meta.env.VITE_LANDING_URL;
        if (landingUrl) {
          return landingUrl;
        }
        
        // Fallback to localhost for development
        const { hostname } = window.location;
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
          return 'http://localhost:3000/';
        }
        
        return '/';
      } catch {
        return '/';
      }
    };
    try {
      await signOut({ redirectUrl: getLandingRedirectUrl() } as any);
    } catch (err) {
      console.error('Error during sign out:', err);
    }
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
        <motion.div 
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className={clsx(
            'fixed top-6 right-6 z-50 px-6 py-3 rounded-xl shadow-2xl text-white backdrop-blur-sm border',
            showToast.type === 'success' 
              ? 'bg-gradient-to-r from-green-500 to-green-600 border-green-400/30' 
              : 'bg-gradient-to-r from-red-500 to-red-600 border-red-400/30'
          )}
        >
          <div className="flex items-center gap-2">
            {showToast.type === 'success' ? (
              <CheckCircle size={18} className="text-green-100" />
            ) : (
              <AlertCircle size={18} className="text-red-100" />
            )}
            <span className="font-medium">{showToast.message}</span>
          </div>
        </motion.div>
      )}
      <div className="flex gap-1 border-b border-base-200/60 mb-6 bg-base-100/50 rounded-lg p-1">
        <button 
          className={clsx(
            'px-6 py-3 font-semibold text-sm transition-all duration-200 rounded-md relative',
            tab === 'profile' 
              ? 'text-primary bg-primary/10 border-b-2 border-primary' 
              : 'text-base-content/70 hover:text-primary hover:bg-base-200/50'
          )} 
          onClick={() => setTab('profile')}
        >
          <div className="flex items-center gap-2">
            <User size={16} />
            Profile
          </div>
        </button>
        <button 
          className={clsx(
            'px-6 py-3 font-semibold text-sm transition-all duration-200 rounded-md relative',
            tab === 'account' 
              ? 'text-primary bg-primary/10 border-b-2 border-primary' 
              : 'text-base-content/70 hover:text-primary hover:bg-base-200/50'
          )} 
          onClick={() => setTab('account')}
        >
          <div className="flex items-center gap-2">
            <Shield size={16} />
            Account
          </div>
        </button>
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
                <div className="bg-gradient-to-r from-base-100/80 to-base-200/40 rounded-xl p-4 border border-base-300/30 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Target size={16} className="text-primary" />
              </div>
                      <div>
                        <h3 className="font-semibold text-base-content text-sm">Profile Completion</h3>
                        <p className="text-xs text-base-content/60">Complete your profile to unlock more features</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-primary">{completion}%</span>
                  </div>
                  
                  <div className="w-full h-3 bg-base-200 rounded-full overflow-hidden mb-3">
                    <div 
                      className="h-3 bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-500 ease-out shadow-sm" 
                      style={{ width: `${completion}%` }} 
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="flex items-center gap-2 hover:bg-primary/10 hover:text-primary transition-colors">
                      <Eye size={14} />
                      Preview Public Profile
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href); 
                        setShowToast({type:'success',message:'Profile link copied!'});
                      }}
                      className="flex items-center gap-2 hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      <Link2 size={14} />
                      Copy Link
                    </Button>
                  </div>
            </div>
            {/* Avatar and Editable Fields */}
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="relative group">
                <div className="w-28 h-28 rounded-2xl bg-gradient-to-tr from-primary via-primary/80 to-accent flex items-center justify-center border-2 border-primary/30 shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-primary/25">
                  <img src={user?.imageUrl || '/avatar.png'} alt="avatar" className="w-24 h-24 rounded-xl object-cover border-2 border-white/90 shadow-inner" />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Button 
                    size="icon" 
                    className="absolute bottom-2 right-2 bg-primary text-primary-content border-none shadow-lg hover:bg-primary/80 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0" 
                    title="Edit Avatar"
                  >
                    <Edit size={16} />
                  </Button>
                </div>
              </div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="font-semibold text-sm text-base-content/80 flex items-center gap-2">
                    <User size={14} className="text-primary" />
                    Full Name
                  </label>
                  <input 
                    value={fullName} 
                    onChange={e => setFullName(e.target.value)} 
                    className="w-full border border-base-200/60 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all bg-base-50/50 hover:bg-base-50" 
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-semibold text-sm text-base-content/80 flex items-center gap-2">
                    <User size={14} className="text-primary" />
                    Username
                  </label>
                  <input 
                    value={username} 
                    onChange={e => setUsername(e.target.value)} 
                    className="w-full border border-base-200/60 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all bg-base-50/50 hover:bg-base-50" 
                    placeholder="Choose a username"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="font-semibold text-sm text-base-content/80 flex items-center gap-2">
                    <MessageCircle size={14} className="text-primary" />
                    Bio / Headline
                  </label>
                  <textarea 
                    value={bio} 
                    onChange={e => { setBio(e.target.value); setBioCount(e.target.value.length); }} 
                    maxLength={120} 
                    className="w-full border border-base-200/60 rounded-lg px-4 py-3 min-h-[56px] text-base focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all bg-base-50/50 hover:bg-base-50 resize-none" 
                    placeholder="Tell us about yourself in a few words..."
                  />
                  <div className="text-xs text-base-content/50 text-right">{bioCount}/120</div>
                </div>
                <div className="space-y-2">
                  <label className="font-semibold text-sm text-base-content/80 flex items-center gap-2">
                    <MapPin size={14} className="text-primary" />
                    Location
                  </label>
                  <input 
                    value={location} 
                    onChange={e => setLocation(e.target.value)} 
                    className="w-full border border-base-200/60 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all bg-base-50/50 hover:bg-base-50" 
                    placeholder="City, Country"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-semibold text-sm text-base-content/80 flex items-center gap-2">
                    <BookOpen size={14} className="text-primary" />
                    About Me
                  </label>
                  <textarea 
                    value={about} 
                    onChange={e => setAbout(e.target.value)} 
                    maxLength={200} 
                    className="w-full border border-base-200/60 rounded-lg px-4 py-3 min-h-[56px] text-base focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all bg-base-50/50 hover:bg-base-50 resize-none" 
                    placeholder="Share more details about yourself..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-semibold text-sm text-base-content/80 flex items-center gap-2">
                    <Github size={14} className="text-primary" /> 
                    GitHub
                  </label>
                  <input 
                    value={github} 
                    onChange={e => setGithub(e.target.value)} 
                    placeholder="https://github.com/username" 
                    className="w-full border border-base-200/60 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all bg-base-50/50 hover:bg-base-50" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-semibold text-sm text-base-content/80 flex items-center gap-2">
                    <Linkedin size={14} className="text-primary" /> 
                    LinkedIn
                  </label>
                  <input 
                    value={linkedin} 
                    onChange={e => setLinkedin(e.target.value)} 
                    placeholder="https://linkedin.com/in/username" 
                    className="w-full border border-base-200/60 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all bg-base-50/50 hover:bg-base-50" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-semibold text-sm text-base-content/80 flex items-center gap-2">
                    <Twitter size={14} className="text-primary" /> 
                    Twitter
                  </label>
                  <input 
                    value={twitter} 
                    onChange={e => setTwitter(e.target.value)} 
                    placeholder="https://twitter.com/username" 
                    className="w-full border border-base-200/60 rounded-lg px-4 py-3 text-base focus:ring-1 focus:ring-primary/40 focus:border-primary/60 transition-all bg-base-50/50 hover:bg-base-50" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-semibold text-sm text-base-content/80 flex items-center gap-2">
                    <Globe size={14} className="text-primary" /> 
                    Website
                  </label>
                  <input 
                    value={website} 
                    onChange={e => setWebsite(e.target.value)} 
                    placeholder="https://yourwebsite.com" 
                    className="w-full border border-base-200/60 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all bg-base-50/50 hover:bg-base-50" 
                  />
                </div>
              </div>
            </div>
            
            {/* Skills Management */}
            <div className="bg-gradient-to-r from-base-100/80 to-base-200/40 rounded-xl p-5 border border-base-300/30 shadow-sm">
              <h3 className="font-semibold mb-4 text-base-content/90 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <BookOpen size={18} className="text-primary" />
                </div>
                <div>
                  <div className="text-base font-semibold">Skills & Technologies</div>
                  <div className="text-xs text-base-content/60">Showcase your technical expertise</div>
                </div>
              </h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <input
                    value={newSkill}
                    onChange={e => setNewSkill(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleAddSkill()}
                    placeholder="Add a skill (e.g., React, Python, UI/UX)"
                    className="flex-1 border border-base-200/60 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all bg-base-50/50 hover:bg-base-50"
                  />
                  <Button 
                    onClick={handleAddSkill} 
                    disabled={!newSkill.trim()} 
                    size="default"
                    className="bg-primary text-primary-content hover:bg-primary/90 px-6 transition-all duration-200 hover:scale-105"
                  >
                    <Plus size={16} className="mr-2" />
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {skills.map((skill, index) => (
                    <div key={index} className="flex items-center gap-2 bg-gradient-to-r from-primary/10 to-primary/5 text-primary px-4 py-2 rounded-full text-sm border border-primary/20 hover:border-primary/40 transition-all duration-200 hover:scale-105 group">
                      <Zap size={14} className="text-primary/70 group-hover:text-primary transition-colors" />
                      <span className="font-medium">{skill}</span>
                      <button
                        onClick={() => handleRemoveSkill(skill)}
                        className="hover:bg-primary/20 rounded-full p-1 transition-colors hover:scale-110"
                        title="Remove skill"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  {skills.length === 0 && (
                    <div className="text-center py-6 text-base-content/50">
                      <BookOpen size={24} className="mx-auto mb-2 opacity-50" />
                      <span className="text-sm">No skills added yet</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Enhanced Skills Progress */}
            <div className="bg-base-100 border border-base-200 rounded-lg p-4">
              <h3 className="font-semibold mb-3 text-base-content/90 flex items-center gap-2">
                <Star size={16} className="text-primary" />
                Enhanced Skills Progress
              </h3>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    value={newSkillProgress.skill}
                    onChange={e => setNewSkillProgress(prev => ({ ...prev, skill: e.target.value }))}
                    onKeyPress={e => e.key === 'Enter' && handleAddSkillProgress()}
                    placeholder="Add a skill (e.g., React, Python, UI/UX)"
                    className="flex-1 border border-base-200 rounded px-3 py-2 text-base focus:ring-1 focus:ring-primary/30 transition-all"
                  />
                  <Button onClick={handleAddSkillProgress} disabled={!newSkillProgress.skill.trim()} size="sm" className="bg-primary text-primary-content hover:bg-primary/90">
                    <Plus size={16} />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skillProgress.map((sp, index) => (
                    <div key={index} className="flex items-center gap-2 bg-base-200 rounded-full px-3 py-1 text-sm">
                      <span>{sp.skill}</span>
                      <div className="flex items-center gap-1">
                        <select
                          value={sp.level}
                          onChange={e => handleUpdateSkillProgress(sp.skill, 'level', e.target.value as 'beginner' | 'intermediate' | 'advanced' | 'expert')}
                          className="border border-base-200 rounded px-1 py-0.5 text-xs"
                        >
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                          <option value="expert">Expert</option>
                        </select>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={sp.progress}
                          onChange={e => handleUpdateSkillProgress(sp.skill, 'progress', Number(e.target.value))}
                          className="w-16 border border-base-200 rounded px-1 py-0.5 text-xs text-center"
                        />
                        <button
                          onClick={() => handleRemoveSkillProgress(sp.skill)}
                          className="hover:bg-error/20 rounded-full p-0.5 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {skillProgress.length === 0 && (
                    <span className="text-base-content/50 text-sm">No enhanced skills added yet</span>
                  )}
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-gradient-to-r from-base-100/80 to-base-200/40 rounded-xl p-5 border border-base-300/30 shadow-sm">
              <h3 className="font-semibold mb-4 text-base-content/90 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Award size={18} className="text-primary" />
                </div>
                <div>
                  <div className="text-base font-semibold">Achievements & Badges</div>
                  <div className="text-xs text-base-content/60">Track your accomplishments and milestones</div>
                </div>
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    value={newBadge.name}
                    onChange={e => setNewBadge(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Achievement Name"
                    className="border border-base-200/60 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all bg-base-50/50 hover:bg-base-50"
                  />
                  <input
                    value={newBadge.description}
                    onChange={e => setNewBadge(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Achievement Description"
                    className="border border-base-200/60 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all bg-base-50/50 hover:bg-base-50"
                  />
                </div>
                <div className="flex gap-3">
                  <select
                    value={newBadge.category}
                    onChange={e => setNewBadge(prev => ({ ...prev, category: e.target.value as any }))}
                    className="border border-base-200/60 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all bg-base-50/50 hover:bg-base-50"
                  >
                    <option value="crucible">Crucible</option>
                    <option value="forge">Forge</option>
                    <option value="arena">Arena</option>
                    <option value="streak">Streak</option>
                    <option value="special">Special</option>
                  </select>
                  <input
                    value={newBadge.icon}
                    onChange={e => setNewBadge(prev => ({ ...prev, icon: e.target.value }))}
                    placeholder="🏆"
                    className="w-24 border border-base-200/60 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all text-center bg-base-50/50 hover:bg-base-50"
                  />
                  <Button 
                    onClick={handleAddBadge} 
                    disabled={!newBadge.name.trim() || !newBadge.description.trim()} 
                    size="default"
                    className="bg-primary text-primary-content hover:bg-primary/90 px-6 transition-all duration-200 hover:scale-105"
                  >
                    <Plus size={16} className="mr-2" />
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {badges.map((badge) => (
                    <div key={badge.id} className="flex items-center gap-2 bg-gradient-to-r from-base-200/60 to-base-200/40 rounded-full px-4 py-2 text-sm border border-base-300/30 hover:border-base-400/50 transition-all duration-200 hover:scale-105 group">
                      <Trophy size={14} className="text-primary/70 group-hover:text-primary transition-colors" />
                      <span className="font-medium">{badge.name}</span>
                      <button
                        onClick={() => handleRemoveBadge(badge.id)}
                        className="hover:bg-red-200 rounded-full p-1 transition-colors hover:scale-110"
                        title="Remove achievement"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  {badges.length === 0 && (
                    <div className="text-center py-6 text-base-content/50">
                      <Award size={24} className="mx-auto mb-2 opacity-50" />
                      <span className="text-sm">No achievements added yet</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Certificates */}
            <div className="bg-base-100 border border-base-200 rounded-lg p-4">
              <h3 className="font-semibold mb-3 text-base-content/90 flex items-center gap-2">
                <Star size={16} className="text-primary" />
                Certificates
              </h3>
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <input
                    value={newCertificate.name}
                    onChange={e => setNewCertificate(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Certificate Name"
                    className="border border-base-200 rounded px-3 py-2 text-base focus:ring-1 focus:ring-primary/30 transition-all"
                  />
                  <input
                    value={newCertificate.issuer}
                    onChange={e => setNewCertificate(prev => ({ ...prev, issuer: e.target.value }))}
                    placeholder="Issuing Organization"
                    className="border border-base-200 rounded px-3 py-2 text-base focus:ring-1 focus:ring-primary/30 transition-all"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <input
                    type="date"
                    value={newCertificate.issueDate}
                    onChange={e => setNewCertificate(prev => ({ ...prev, issueDate: e.target.value }))}
                    className="border border-base-200 rounded px-3 py-2 text-base focus:ring-1 focus:ring-primary/30 transition-all"
                  />
                  <input
                    type="date"
                    value={newCertificate.expiryDate}
                    onChange={e => setNewCertificate(prev => ({ ...prev, expiryDate: e.target.value }))}
                    placeholder="Expiry Date (Optional)"
                    className="border border-base-200 rounded px-3 py-2 text-base focus:ring-1 focus:ring-primary/30 transition-all"
                  />
                  <select
                    value={newCertificate.category}
                    onChange={e => setNewCertificate(prev => ({ ...prev, category: e.target.value as any }))}
                    className="border border-base-200 rounded px-3 py-2 text-base focus:ring-1 focus:ring-primary/30 transition-all"
                  >
                    <option value="technical">Technical</option>
                    <option value="academic">Academic</option>
                    <option value="professional">Professional</option>
                    <option value="platform">Platform</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <input
                    value={newCertificate.credentialUrl}
                    onChange={e => setNewCertificate(prev => ({ ...prev, credentialUrl: e.target.value }))}
                    placeholder="Credential URL (Optional)"
                    className="flex-1 border border-base-200 rounded px-3 py-2 text-base focus:ring-1 focus:ring-primary/30 transition-all"
                  />
                  <Button onClick={handleAddCertificate} disabled={!newCertificate.name.trim() || !newCertificate.issuer.trim() || !newCertificate.issueDate} size="sm" className="bg-primary text-primary-content hover:bg-primary/90">
                    <Plus size={16} />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {certificates.map((cert) => (
                    <div key={cert.id} className="flex items-center gap-2 bg-base-200 rounded-full px-3 py-1 text-sm">
                      <span>{cert.name} - {cert.issuer}</span>
                      <button
                        onClick={() => handleRemoveCertificate(cert.id)}
                        className="hover:bg-red-200 rounded-full p-0.5 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  {certificates.length === 0 && (
                    <span className="text-base-content/50 text-sm">No certificates added yet</span>
                  )}
                </div>
              </div>
            </div>

            {/* Milestones */}
            <div className="bg-base-100 border border-base-200 rounded-lg p-4">
              <h3 className="font-semibold mb-3 text-base-content/90 flex items-center gap-2">
                <Star size={16} className="text-primary" />
                Milestones
              </h3>
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <input
                    value={newMilestone.name}
                    onChange={e => setNewMilestone(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Milestone Name"
                    className="border border-base-200 rounded px-3 py-2 text-base focus:ring-1 focus:ring-primary/30 transition-all"
                  />
                  <input
                    value={newMilestone.description}
                    onChange={e => setNewMilestone(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Milestone Description"
                    className="border border-base-200 rounded px-3 py-2 text-base focus:ring-1 focus:ring-primary/30 transition-all"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={newMilestone.category}
                    onChange={e => setNewMilestone(prev => ({ ...prev, category: e.target.value as any }))}
                    className="border border-base-200 rounded px-3 py-2 text-base focus:ring-1 focus:ring-primary/30 transition-all"
                  >
                    <option value="problems">Problems</option>
                    <option value="resources">Resources</option>
                    <option value="collaboration">Collaboration</option>
                    <option value="streak">Streak</option>
                  </select>
                  <input
                    type="number"
                    min="0"
                    value={newMilestone.value}
                    onChange={e => setNewMilestone(prev => ({ ...prev, value: Number(e.target.value) }))}
                    placeholder="Value"
                    className="w-24 border border-base-200 rounded px-3 py-2 text-base focus:ring-1 focus:ring-primary/30 transition-all"
                  />
                  <Button onClick={handleAddMilestone} disabled={!newMilestone.name.trim() || !newMilestone.description.trim()} size="sm" className="bg-primary text-primary-content hover:bg-primary/90">
                    <Plus size={16} />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {milestones.map((milestone) => (
                    <div key={milestone.id} className="flex items-center gap-2 bg-base-200 rounded-full px-3 py-1 text-sm">
                      <span>{milestone.name} ({milestone.value})</span>
                      <button
                        onClick={() => handleRemoveMilestone(milestone.id)}
                        className="hover:bg-red-200 rounded-full p-0.5 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  {milestones.length === 0 && (
                    <span className="text-base-content/50 text-sm">No milestones added yet</span>
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
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-base-100/80 to-base-200/40 rounded-xl border border-base-300/30 shadow-sm">
              <div className="flex items-center gap-4">
                <Button 
                  onClick={handleSave} 
                  disabled={saving} 
                  className="bg-gradient-to-r from-primary to-primary/80 text-primary-content hover:from-primary/90 hover:to-primary/70 px-8 py-2 transition-all duration-200 hover:scale-105 shadow-lg shadow-primary/25"
                >
                  {saving ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Saving...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} />
                      Save Changes
                    </div>
                  )}
                </Button>
                <Button 
                  onClick={handleCancel} 
                  variant="outline" 
                  disabled={saving}
                  className="px-6 py-2 hover:bg-base-200/60 transition-all duration-200"
                >
                  Cancel
                </Button>
              </div>
              {profileUpdated && (
                <div className="flex items-center gap-2 text-xs text-base-content/60 bg-base-200/50 px-3 py-2 rounded-lg border border-base-300/30">
                  <Clock size={12} />
                  <span>Last updated: {profileUpdated.toLocaleTimeString()}</span>
                </div>
              )}
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
            <div className="flex gap-2 mt-2 flex-wrap">
              <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
                <LogOut size={16} />
                Logout
              </Button>
              <Button variant="outline" onClick={handleExportData}>Export Data</Button>
              <Button variant="destructive" onClick={() => setShowDeleteModal(true)}>Deactivate / Delete Account</Button>
            </div>

            {/* Profile Visibility Settings */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="bg-gradient-to-br from-base-100/80 to-base-200/40 rounded-xl shadow-sm border border-base-300/30 backdrop-blur-sm relative z-0 hover:shadow-md transition-all duration-300"
            >
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-info/15 to-info/5 border border-info/20 shadow-sm">
                    <Eye className="w-4 h-4 text-info" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-base-content">Profile Visibility</h3>
                    <p className="text-xs text-base-content/60">Control who can see your profile information</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-base-200/40 border border-base-300/20 hover:bg-base-200/60 transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-md bg-info/10">
                        {profileVisibility.isPublic ? <Unlock className="w-3.5 h-3.5 text-info" /> : <Lock className="w-3.5 h-3.5 text-info" />}
                      </div>
                      <div>
                        <p className="font-medium text-base-content text-sm">Public Profile</p>
                        <p className="text-xs text-base-content/60">
                          Allow others to view your profile at /profile/{username}
                        </p>
                      </div>
                    </div>
                    <CustomToggle
                      id="profile-public"
                      checked={profileVisibility.isPublic}
                      onChange={(checked) => setProfileVisibility(prev => ({ ...prev, isPublic: checked }))}
                      className="toggler-compact"
                    />
                  </div>

                  {profileVisibility.isPublic && (
                    <div className="space-y-3 p-3 bg-base-200/30 rounded-lg border border-base-300/20">
                      <div className="text-sm font-medium text-base-content/80 mb-3">What to show on public profile:</div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-base-content/60" />
                          <span className="text-sm">Performance Stats</span>
                        </div>
                        <CustomToggle
                          id="show-stats"
                          checked={profileVisibility.showStats}
                          onChange={(checked) => setProfileVisibility(prev => ({ ...prev, showStats: checked }))}
                          className="toggler-compact"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Trophy className="w-4 h-4 text-base-content/60" />
                          <span className="text-sm">Achievements & Badges</span>
                        </div>
                        <CustomToggle
                          id="show-achievements"
                          checked={profileVisibility.showAchievements}
                          onChange={(checked) => setProfileVisibility(prev => ({ ...prev, showAchievements: checked }))}
                          className="toggler-compact"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Brain className="w-4 h-4 text-base-content/60" />
                          <span className="text-sm">Skills & Technologies</span>
                        </div>
                        <CustomToggle
                          id="show-skills"
                          checked={profileVisibility.showSkills}
                          onChange={(checked) => setProfileVisibility(prev => ({ ...prev, showSkills: checked }))}
                          className="toggler-compact"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Link2 className="w-4 h-4 text-base-content/60" />
                          <span className="text-sm">Social Links</span>
                        </div>
                        <CustomToggle
                          id="show-social"
                          checked={profileVisibility.showSocialLinks}
                          onChange={(checked) => setProfileVisibility(prev => ({ ...prev, showSocialLinks: checked }))}
                          className="toggler-compact"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <School className="w-4 h-4 text-base-content/60" />
                          <span className="text-sm">College Details</span>
                        </div>
                        <CustomToggle
                          id="show-college"
                          checked={profileVisibility.showCollegeDetails}
                          onChange={(checked) => setProfileVisibility(prev => ({ ...prev, showCollegeDetails: checked }))}
                          className="toggler-compact"
                        />
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-base-content/50 bg-base-200/50 p-3 rounded-lg border border-base-300/30 flex items-center gap-2">
                    <Lightbulb size={14} className="text-primary/70" />
                    <span><strong>Tip:</strong> Your profile will be accessible at <code className="bg-base-300 px-1 rounded">/profile/{username}</code> when public</span>
                  </div>
                  
                  <div className="flex justify-end pt-3">
                    <Button 
                      onClick={handleSaveVisibility}
                      size="sm"
                      className="bg-info hover:bg-info/90 text-info-content"
                    >
                      Save Visibility Settings
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Delete Modal */}
            {showDeleteModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-base-300/50 backdrop-blur-sm">
                <div className="bg-base-100 rounded-xl shadow-xl p-8 max-w-sm w-full border border-base-300/30">
                  <h2 className="text-lg font-bold mb-2 text-base-content">Delete Account?</h2>
                  <p className="text-base-content/70 mb-4">Are you sure you want to delete your account? This action cannot be undone.</p>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleDeleteAccount}
                      className="bg-error hover:bg-error/90 text-error-content"
                    >
                      Delete
                    </Button>
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

  const [additionalPrefs, setAdditionalPrefs] = useState({
    autoSave: true,
    keyboardShortcuts: true
  });

  return (
    <div className="flex flex-col gap-5 w-full h-full p-4">
      {/* Theme Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-gradient-to-br from-base-100/80 to-base-200/40 rounded-xl shadow-sm border border-base-300/30 backdrop-blur-sm relative z-10 hover:shadow-md transition-all duration-300"
      >
        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 shadow-sm">
              <Palette className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-base-content">Theme & Appearance</h3>
              <p className="text-xs text-base-content/60">Customize your visual experience</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 rounded-lg bg-base-200/40 border border-base-300/20 hover:bg-base-200/60 transition-all duration-200">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-primary/10">
                <Sun className="w-3.5 h-3.5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-base-content text-sm">Theme Selection</p>
                <p className="text-xs text-base-content/60">Choose from our curated collection</p>
              </div>
            </div>
            <ThemeSwitcher />
          </div>
        </div>
      </motion.div>

      {/* Notifications Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-gradient-to-br from-base-100/80 to-base-200/40 rounded-xl shadow-sm border border-base-300/30 backdrop-blur-sm relative z-0 hover:shadow-md transition-all duration-300"
      >
        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-secondary/15 to-secondary/5 border border-secondary/20 shadow-sm">
              <Bell className="w-4 h-4 text-secondary" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-base-content">Notifications</h3>
              <p className="text-xs text-base-content/60">Manage your notification preferences</p>
            </div>
          </div>
          
          <div className="space-y-2">
            {[
              { key: 'upvotes', label: 'Upvotes & Reactions', description: 'Get notified when someone upvotes your content', icon: TrendingUp },
              { key: 'approvals', label: 'Project Approvals', description: 'Notifications for project approval status', icon: CheckCircle },
              { key: 'mentions', label: 'Mentions & Comments', description: 'When someone mentions you in discussions', icon: MessageCircle },
              { key: 'invites', label: 'Invite Reminders', description: 'Reminders for pending invitations', icon: Mail }
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-4 rounded-xl bg-base-200/40 border border-base-300/20 hover:bg-base-200/60 transition-all duration-200 group">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <item.icon size={16} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-base-content text-sm truncate">{item.label}</p>
                    <p className="text-xs text-base-content/60 truncate">{item.description}</p>
                  </div>
                </div>
                <CustomToggle
                  id={`notification-${item.key}`}
                  checked={notifications[item.key as keyof typeof notifications]}
                  onChange={(checked) => setNotifications(prev => ({ ...prev, [item.key]: checked }))}
                  className="toggler-compact"
                />
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
        className="bg-gradient-to-br from-base-100/80 to-base-200/40 rounded-xl shadow-sm border border-base-300/30 backdrop-blur-sm relative z-0 hover:shadow-md transition-all duration-300"
      >
        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-accent/15 to-accent/5 border border-accent/20 shadow-sm">
              <Settings className="w-4 h-4 text-accent" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-base-content">Additional Preferences</h3>
              <p className="text-xs text-base-content/60">Fine-tune your experience</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-base-200/40 border border-base-300/20 hover:bg-base-200/60 transition-all duration-200">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-medium text-base-content text-sm">Auto-save</h4>
                <CustomToggle
                  id="auto-save"
                  checked={additionalPrefs.autoSave}
                  onChange={(checked) => setAdditionalPrefs(prev => ({ ...prev, autoSave: checked }))}
                  className="toggler-compact"
                />
              </div>
              <p className="text-xs text-base-content/60">Automatically save your work</p>
            </div>
            
            <div className="p-3 rounded-lg bg-base-200/40 border border-base-300/20 hover:bg-base-200/60 transition-all duration-200">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-medium text-base-content text-sm">Keyboard Shortcuts</h4>
                <CustomToggle
                  id="keyboard-shortcuts"
                  checked={additionalPrefs.keyboardShortcuts}
                  onChange={(checked) => setAdditionalPrefs(prev => ({ ...prev, keyboardShortcuts: checked }))}
                  className="toggler-compact"
                />
              </div>
              <p className="text-xs text-base-content/60">Enable keyboard shortcuts</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function WorkspaceSection() {
  const [activeTab, setActiveTab] = useState<'projects' | 'bookmarks' | 'channels'>('projects');
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  
  const { projects, loading: projectsLoading, error: projectsError, submitting, updating, deleting, createProject, editProject, removeProject, archiveProject } = useUserProjects();
  const { bookmarks, channelMemberships, loading: workspaceLoading, error: workspaceError, leavingChannel, removeBookmarkItem, updateChannelNotifications, leaveChannel } = useWorkspaceSettings();

  const handleProjectSubmit = async (data: any) => {
    try {
      if (editingProject) {
        await editProject(editingProject._id, data);
      } else {
        await createProject(data);
      }
      setShowProjectModal(false);
      setEditingProject(null);
    } catch (error) {
      console.error('Error handling project submission:', error);
    }
  };

  const handleEditProject = (project: any) => {
    setEditingProject(project);
    setShowProjectModal(true);
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await removeProject(projectId);
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const handleArchiveProject = async (projectId: string) => {
    try {
      await archiveProject(projectId);
    } catch (error) {
      console.error('Error archiving project:', error);
    }
  };

  const getStatusBadge = (isApproved: boolean, isArchived?: boolean) => {
    if (isArchived) {
      return <span className="badge badge-neutral bg-neutral text-neutral-content">Archived</span>;
    }
    return isApproved ? 
      <span className="badge badge-success bg-success text-success-content">Approved</span> :
      <span className="badge badge-warning bg-warning text-warning-content">Pending</span>;
  };

  const getChannelStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'warning', bg: 'bg-warning', text: 'text-warning-content' },
      approved: { color: 'success', bg: 'bg-success', text: 'text-success-content' },
      denied: { color: 'error', bg: 'bg-error', text: 'text-error-content' },
      banned: { color: 'error', bg: 'bg-error', text: 'text-error-content' },
      kicked: { color: 'neutral', bg: 'bg-neutral', text: 'text-neutral-content' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <span className={`badge badge-${config.color} ${config.bg} ${config.text} capitalize`}>
        {status}
      </span>
    );
  };

  const getResourceTypeIcon = (type: string) => {
    const icons = {
      'forge': <BookOpen size={14} />,
      'nirvana-tool': <Settings size={14} />,
      'nirvana-news': <MessageCircle size={14} />,
      'nirvana-hackathon': <Star size={14} />
    };
    return icons[type as keyof typeof icons] || <Bookmark size={14} />;
  };

  if (workspaceLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-base-content/70">Loading workspace settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full h-full p-6">
      {/* Error Display */}
      {(projectsError || workspaceError) && (
        <div className="alert alert-error bg-error/10 border-error/20 text-error-content">
          <AlertCircle size={20} />
          <div>
          <p className="font-semibold">Error:</p>
          <p>{projectsError || workspaceError}</p>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-1 border-b border-base-200">
        {[
          { key: 'projects', label: 'My Projects', icon: Folder },
          { key: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
          { key: 'channels', label: 'Channels', icon: Users }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={`flex items-center gap-2 px-4 py-2 font-medium text-sm transition-all ${
              activeTab === key 
                ? 'border-b-2 border-primary text-primary' 
                : 'text-base-content/70 hover:text-primary'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* Projects Tab */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-base-content">My Projects</h3>
            <Button 
              onClick={() => setShowProjectModal(true)}
              className="bg-primary text-primary-content hover:bg-primary/90"
            >
              <Plus size={16} className="mr-2" />
              Submit New Project
            </Button>
          </div>

          {projectsLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12 bg-base-100 rounded-lg border border-base-200">
              <Folder size={48} className="mx-auto text-base-content/30 mb-4" />
              <h4 className="text-lg font-semibold text-base-content mb-2">No projects yet</h4>
              <p className="text-base-content/60 mb-4">Start building and share your projects with the community!</p>
              <Button 
                onClick={() => setShowProjectModal(true)}
                className="bg-primary text-primary-content hover:bg-primary/90"
              >
                Submit Your First Project
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((project) => (
                <div key={project._id} className="bg-base-100 rounded-lg p-4 border border-base-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-bold text-base-content flex items-center gap-2">
                        <BookOpen size={16} />
                        {project.title}
                      </h4>
                      {project.description && (
                        <p className="text-sm text-base-content/70 mt-1 line-clamp-2">
                          {project.description}
                        </p>
                      )}
                    </div>
                    {getStatusBadge(project.isApproved, project.isArchived)}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-base-content/60 mb-3">
                    <span className="flex items-center gap-1">
                      <Eye size={12} className="text-base-content/50" />
                      {project.views || 0} views
                    </span>
                    <span className="flex items-center gap-1">
                      <Bookmark size={12} className="text-base-content/50" />
                      {project.bookmarks || 0} bookmarks
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp size={12} className="text-base-content/50" />
                      {project.upvotes} upvotes
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingDown size={12} className="text-base-content/50" />
                      {project.downvotes} downvotes
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEditProject(project)}
                      disabled={updating === project._id}
                    >
                      <Edit size={14} className="mr-1" />
                      {updating === project._id ? 'Updating...' : 'Edit'}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleArchiveProject(project._id)}
                      disabled={updating === project._id}
                    >
                      <Archive size={14} className="mr-1" />
                      Archive
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => setShowDeleteConfirm(project._id)}
                      disabled={deleting === project._id}
                    >
                      <Trash size={14} className="mr-1" />
                      {deleting === project._id ? 'Deleting...' : 'Delete'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}



      {/* Bookmarks Tab */}
      {activeTab === 'bookmarks' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-base-content">Bookmarked Resources</h3>
          
          {bookmarks.length === 0 ? (
            <div className="text-center py-12 bg-base-100 rounded-lg border border-base-200">
              <Bookmark size={48} className="mx-auto text-base-content/30 mb-4" />
              <h4 className="text-lg font-semibold text-base-content mb-2">No bookmarks yet</h4>
              <p className="text-base-content/60">Start bookmarking resources from Forge, Nirvana, and other sections!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookmarks.map((bookmark) => (
                <div key={bookmark._id} className="flex items-center gap-3 bg-base-100 rounded-lg p-3 border border-base-200 hover:bg-base-200/50 transition-colors">
                  <div className="p-2 rounded-lg bg-primary/10">
                    {getResourceTypeIcon(bookmark.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-base-content truncate">{bookmark.title}</h4>
                    {bookmark.description && (
                      <p className="text-sm text-base-content/60 truncate">{bookmark.description}</p>
                    )}
                    <p className="text-xs text-base-content/40 mt-1">
                      Bookmarked on {new Date(bookmark.bookmarkedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {bookmark.url && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={bookmark.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink size={14} />
                        </a>
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => removeBookmarkItem(bookmark._id, bookmark.type)}
                      className="text-error hover:text-error hover:bg-error/10"
                    >
                      <X size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Channels Tab */}
      {activeTab === 'channels' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-base-content">Channel Memberships</h3>
            <div className="text-sm text-base-content/60">
              {channelMemberships.filter(m => m.status === 'approved').length} active channels
            </div>
          </div>
          
          {channelMemberships.length === 0 ? (
            <div className="text-center py-12 bg-base-100 rounded-lg border border-base-200">
              <Users size={48} className="mx-auto text-base-content/30 mb-4" />
              <h4 className="text-lg font-semibold text-base-content mb-2">No channel memberships</h4>
              <p className="text-base-content/60">Join channels from the Arena to start collaborating!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Active Channels */}
              {channelMemberships.filter(m => m.status === 'approved').length > 0 && (
                <div>
                  <h4 className="font-semibold text-base-content mb-3 flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-500" />
                    Active Channels ({channelMemberships.filter(m => m.status === 'approved').length})
                  </h4>
                  <div className="space-y-3">
                    {channelMemberships
                      .filter(membership => membership.status === 'approved')
                                             .map((membership) => (
                         <div key={membership.channelId} className="bg-base-100 rounded-lg p-4 border border-base-200 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <div className="p-2 rounded-lg bg-success/10 border border-success/20">
                                <MessageCircle size={16} className="text-success" />
                              </div>
                                                             <div className="flex-1 min-w-0">
                                 <h4 className="font-semibold text-base-content">{membership.name}</h4>
                                 <p className="text-sm text-base-content/60 capitalize">{membership.type} channel</p>
                               </div>
                            </div>
                            <div className="flex items-center gap-2">
                                                             <div className="flex items-center gap-1">
                                 <CustomToggle
                                   id={`channel-notify-${membership.channelId}`}
                                   checked={true}
                                   onChange={(checked) => updateChannelNotifications(membership.channelId, checked)}
                                   className="mr-1"
                                 />
                                 <span className="text-xs text-base-content/60">Notify</span>
                               </div>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => leaveChannel(membership.channelId)}
                                disabled={leavingChannel === membership.channelId}
                                className="text-error hover:text-error hover:bg-error/10 border-error/30 hover:border-error/50"
                              >
                                {leavingChannel === membership.channelId ? 'Leaving...' : 'Leave'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Pending Channels */}
              {channelMemberships.filter(m => m.status === 'pending').length > 0 && (
                <div>
                  <h4 className="font-semibold text-base-content mb-3 flex items-center gap-2">
                    <AlertTriangle size={16} className="text-yellow-500" />
                    Pending Requests ({channelMemberships.filter(m => m.status === 'pending').length})
                  </h4>
                  <div className="space-y-3">
                    {channelMemberships
                      .filter(membership => membership.status === 'pending')
                                             .map((membership) => (
                         <div key={membership.channelId} className="bg-base-100 rounded-lg p-4 border border-base-200">
                           <div className="flex items-start justify-between">
                             <div className="flex items-start gap-3 flex-1">
                                                             <div className="p-2 rounded-lg bg-warning/10 border border-warning/20">
                                <MessageCircle size={16} className="text-warning" />
                               </div>
                               <div className="flex-1 min-w-0">
                                 <h4 className="font-semibold text-base-content">{membership.name}</h4>
                                 <p className="text-sm text-base-content/60 capitalize">{membership.type} channel</p>
                                 <p className="text-xs text-base-content/40 mt-1">
                                   Waiting for approval from moderators
                                 </p>
                               </div>
                             </div>
                            <div className="flex items-center gap-2">
                              {getChannelStatusBadge(membership.status)}
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => leaveChannel(membership.channelId)}
                                disabled={leavingChannel === membership.channelId}
                                className="text-neutral hover:text-neutral hover:bg-neutral/10 border-neutral/30 hover:border-neutral/50"
                              >
                                {leavingChannel === membership.channelId ? 'Canceling...' : 'Cancel Request'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Other Status Channels */}
              {channelMemberships.filter(m => !['approved', 'pending'].includes(m.status)).length > 0 && (
                <div>
                  <h4 className="font-semibold text-base-content mb-3 flex items-center gap-2">
                    <X size={16} className="text-red-500" />
                    Other Status ({channelMemberships.filter(m => !['approved', 'pending'].includes(m.status)).length})
                  </h4>
                  <div className="space-y-3">
                    {channelMemberships
                      .filter(membership => !['approved', 'pending'].includes(membership.status))
                                             .map((membership) => (
                         <div key={membership.channelId} className="bg-base-100 rounded-lg p-4 border border-base-200">
                           <div className="flex items-start justify-between">
                             <div className="flex items-start gap-3 flex-1">
                               <div className="p-2 rounded-lg bg-error/10 border border-error/20">
                                 <MessageCircle size={16} className="text-error" />
                               </div>
                               <div className="flex-1 min-w-0">
                                 <h4 className="font-semibold text-base-content">{membership.name}</h4>
                                 <p className="text-sm text-base-content/60 capitalize">{membership.type} channel</p>
                                 <p className="text-xs text-base-content/40 mt-1">
                                   Status: {membership.status}
                                 </p>
                               </div>
                             </div>
                            <div className="flex items-center gap-2">
                              {getChannelStatusBadge(membership.status)}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Project Submission Modal */}
      <ProjectSubmissionModal
        isOpen={showProjectModal}
        onClose={() => {
          setShowProjectModal(false);
          setEditingProject(null);
        }}
        onSubmit={handleProjectSubmit}
        project={editingProject}
        loading={submitting}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-base-300/50 backdrop-blur-sm">
          <div className="bg-base-100 rounded-xl shadow-xl p-6 max-w-sm w-full mx-4 border border-base-300/30">
            <h3 className="text-lg font-bold text-base-content mb-2">Delete Project?</h3>
            <p className="text-base-content/70 mb-4">Are you sure you want to delete this project? This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => handleDeleteProject(showDeleteConfirm)}
                disabled={deleting === showDeleteConfirm}
                className="bg-error hover:bg-error/90 text-error-content"
              >
                {deleting === showDeleteConfirm ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CollaborationSection() {
  // Phase 1: Data fetching and computation
  const { channelMemberships, loading: membershipsLoading, error: membershipsError, refetch: refetchMemberships } = useWorkspaceSettings();
  const { channels, loading: channelsLoading, error: channelsError, refetch: refetchChannels } = useArenaChannels();
  const { channelRoles, getUserChannelRole, isLoading: rolesLoading, globalRole, allRoles } = useUserRole();
  const { getToken } = useAuth();
  
  // State for banned/kicked channels
  const [bannedChannels, setBannedChannels] = React.useState<any[]>([]);
  const [loadingBanned, setLoadingBanned] = React.useState<boolean>(false);
  const [errorBanned, setErrorBanned] = React.useState<string | null>(null);

  // Fetch detailed channel status information including bans
  const fetchDetailedChannelStatus = React.useCallback(async () => {
    try {
      setLoadingBanned(true);
      setErrorBanned(null);
      const response = await ApiService.getDetailedUserChannelStatuses(getToken);
      
      // Filter for banned and kicked channels that are parent channels (no parentChannelId)
      const bannedOrKicked = response.data.filter((status: any) => 
        (status.status === 'banned' || status.status === 'kicked') && 
        !status.parentChannelId
      );
      
      console.log('Banned or kicked parent channels:', bannedOrKicked);
      setBannedChannels(bannedOrKicked);
    } catch (err) {
      console.error('Error fetching detailed channel status:', err);
      setErrorBanned('Failed to fetch moderation information');
    } finally {
      setLoadingBanned(false);
    }
  }, [getToken]);

  // Fetch detailed channel status on component mount
  React.useEffect(() => {
    fetchDetailedChannelStatus();
  }, [fetchDetailedChannelStatus]);

  // Debug logging for Phase 2 troubleshooting
  React.useEffect(() => {
    console.log('=== PHASE 2 DEBUGGING ===');
    console.log('Raw channelMemberships:', channelMemberships);
    console.log('Raw channels:', channels);
    console.log('Raw channelRoles:', channelRoles);
    console.log('Raw globalRole:', globalRole);
    console.log('Raw allRoles:', allRoles);
    console.log('Loading states:', { channelsLoading, membershipsLoading, rolesLoading });
    
    // Additional debugging for role resolution
    if (channelMemberships.length > 0 && Object.keys(channels).length > 0) {
      console.log('=== ROLE RESOLUTION DEBUG ===');
      channelMemberships.forEach(membership => {
        const channelId = String(membership.channelId);
        const channelRole = channelRoles[channelId];
        const resolvedRole = getUserChannelRole(channelId);
        console.log(`Channel ${membership.name}:`, {
          channelId,
          channelRole,
          globalRole,
          resolvedRole,
          finalRole: resolvedRole ?? 'member'
        });
      });
    }
  }, [channelMemberships, channels, channelRoles, globalRole, allRoles, channelsLoading, membershipsLoading, rolesLoading, getUserChannelRole]);

  // Compute view model for approved parent channel memberships
  const approvedParentMemberships = React.useMemo(() => {
    if (channelsLoading || membershipsLoading) {
      return [];
    }

    // Flatten all channels and create a map for quick lookup
    const allChannels = Object.values(channels).flat();
    const idToChannel = new Map(allChannels.map(c => [String(c._id), c]));

    // Filter for approved memberships in parent channels only
    const approvedParentMemberships = channelMemberships.filter(membership => {
      const channel = idToChannel.get(String(membership.channelId));
      return membership.status === 'approved' && channel && !channel.parentChannelId;
    });

    // Add computed role information with detailed debugging
    const enrichedMemberships = approvedParentMemberships.map(membership => {
      const channelId = String(membership.channelId);
      const role = getUserChannelRole(channelId);
      const fallbackRole = 'member';
      const finalRole = role ?? fallbackRole;
      
      console.log(`Role computation for channel ${membership.name} (${channelId}):`, {
        channelId,
        membershipName: membership.name,
        getUserChannelRoleResult: role,
        fallbackRole,
        finalRole,
        channelRolesForThisChannel: channelRoles[channelId],
        globalRole
      });
      
      return {
        ...membership,
        computedRole: finalRole,
        channel: idToChannel.get(channelId)
      };
    });

    // Log for Phase 1 verification
    console.log('Phase 2 - Computed approved parent memberships:', {
      totalMemberships: channelMemberships.length,
      approvedParentCount: enrichedMemberships.length,
      memberships: enrichedMemberships,
      channelsLoading,
      membershipsLoading,
      rolesLoading
    });

    return enrichedMemberships;
  }, [channels, channelMemberships, channelsLoading, membershipsLoading, rolesLoading, getUserChannelRole, channelRoles, globalRole]);

  // Handle retry for both data sources
  const handleRetry = React.useCallback(() => {
    refetchMemberships();
    refetchChannels();
    fetchDetailedChannelStatus();
  }, [refetchMemberships, refetchChannels, fetchDetailedChannelStatus]);

  // Determine overall loading and error states
  const isLoading = channelsLoading || membershipsLoading || rolesLoading;
  const hasError = membershipsError || channelsError;

  // Format date for display
  const formatDate = (date: string | Date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString();
  };

  return (
    <div className="flex flex-col gap-6 w-full h-full p-6">
      {/* Phase 2: Replace placeholder with new component */}
          <RolesAndPermissionsCard
            memberships={approvedParentMemberships}
            loading={isLoading}
            error={hasError}
            onRetry={handleRetry}
          />
      
      <div className="bg-base-100/90 rounded-xl shadow border border-base-200 p-5">
        <div className="font-semibold text-base-content/90 flex items-center gap-2 text-lg mb-2">
          <AlertTriangle size={18} className="text-primary" /> Moderation Flags
          </div>
          
          {loadingBanned ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center gap-4 p-3 bg-base-100 rounded-lg border border-base-200">
                <div className="skeleton h-4 w-32"></div>
                <div className="skeleton h-4 w-20"></div>
                <div className="skeleton h-4 w-16"></div>
              </div>
              ))}
            </div>
          ) : errorBanned ? (
          <div className="alert alert-error bg-error/10 border-error/20 text-error-content">
            <AlertTriangle size={20} />
              <div>
              <h3 className="font-semibold">Error loading moderation information</h3>
              <p className="text-xs">{errorBanned}</p>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={fetchDetailedChannelStatus}
              className="ml-auto"
              >
              <RefreshCw size={16} className="mr-2" />
                Retry
              </Button>
            </div>
          ) : bannedChannels.length === 0 ? (
          <div className="bg-base-100/80 rounded-lg px-4 py-3 border border-base-200 text-base-content/80">
            No moderation flags found. You are not banned or kicked from any channels.
            </div>
          ) : (
          <div className="space-y-3">
              {bannedChannels.map((channel) => (
              <div key={channel.channelId} className="bg-base-100 rounded-lg p-4 border border-base-200">
                <div className="flex items-center justify-between mb-2">
                        <div>
                    <h3 className="font-semibold flex items-center gap-2">
                      <span className="badge badge-error bg-error text-error-content border-error">{channel.status === 'banned' ? 'Banned' : 'Kicked'}</span>
                      {channel.name}
                    </h3>
                          {channel.parentChannelName && (
                      <p className="text-xs text-base-content/60">
                        Parent channel: {channel.parentChannelName}
                            </p>
                          )}
                      </div>
                    </div>
                    
                <div className="text-sm space-y-1">
                      {channel.status === 'banned' && (
                        <>
                      <p>
                        <span className="font-medium">Banned by:</span>{' '}
                              {channel.bannedBy ? channel.bannedBy.fullName || channel.bannedBy.username : 'Unknown'}
                      </p>
                          {channel.banReason && (
                        <p>
                          <span className="font-medium">Reason:</span> {channel.banReason}
                        </p>
                          )}
                          {channel.banExpiresAt && (
                        <p>
                          <span className="font-medium">Expires:</span> {formatDate(channel.banExpiresAt)}
                        </p>
                          )}
                        </>
                      )}
                      
                      {channel.status === 'kicked' && (
                        <>
                      <p>
                        <span className="font-medium">Kicked by:</span>{' '}
                              {channel.kickedBy ? channel.kickedBy.fullName || channel.kickedBy.username : 'Unknown'}
                      </p>
                          {channel.kickedAt && (
                        <p>
                          <span className="font-medium">Kicked on:</span> {formatDate(channel.kickedAt)}
                        </p>
                          )}
                        </>
                      )}
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  );
}

function SupportSection() {
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackCategory, setFeedbackCategory] = useState<'bug' | 'feature' | 'improvement' | 'question' | 'other'>('other');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const { getToken } = useAuth();

  const handleSubmitFeedback = async () => {
    if (!feedbackMessage.trim()) {
      setSubmitStatus({
        type: 'error',
        message: 'Please enter your feedback message'
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      await ApiService.submitFeedback(
        { 
          message: feedbackMessage, 
          category: feedbackCategory 
        },
        getToken
      );

      setSubmitStatus({
        type: 'success',
        message: 'Thank you for your feedback!'
      });
      setFeedbackMessage('');
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitStatus(null);
      }, 5000);
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      setSubmitStatus({
        type: 'error',
        message: error.message || 'Failed to submit feedback. Please try again later.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full h-full p-6">
      <div className="bg-base-100/90 rounded-xl shadow border border-base-200 p-5">
        <div className="font-semibold text-base-content/90 flex items-center gap-2 text-lg mb-2"><HelpCircle size={18} className="text-primary" /> FAQ / Help Center</div>
        <div className="flex flex-col gap-2 mt-1">
          <a href="#" className="text-primary hover:underline">How to use the app?</a>
          <a href="#" className="text-primary hover:underline">Account & Security</a>
          <a href="#" className="text-primary hover:underline">Project Management</a>
        </div>
      </div>
      <div className="bg-base-100/90 rounded-xl shadow border border-base-200 p-5">
        <div className="font-semibold text-base-content/90 flex items-center gap-2 text-lg mb-2"><Mail size={18} className="text-primary" /> Contact Support</div>
        <Button variant="outline">Open Support Chat</Button>
      </div>
      <div className="bg-base-100/90 rounded-xl shadow border border-base-200 p-5">
        <div className="font-semibold text-base-content/90 flex items-center gap-2 text-lg mb-2"><Star size={18} className="text-primary" /> Feedback</div>
        
        {submitStatus && (
          <div className={`p-3 mb-3 rounded-lg text-sm border ${
            submitStatus.type === 'success' 
              ? 'bg-success/10 text-success-content border-success/20' 
              : 'bg-error/10 text-error-content border-error/20'
          }`}>
            {submitStatus.message}
          </div>
        )}
        
        <div className="mb-3">
          <label className="text-sm text-base-content/70 block mb-1">Category</label>
          <select 
            className="w-full border border-base-200 rounded px-3 py-2 text-base focus:ring-1 focus:ring-primary/30 transition-all"
            value={feedbackCategory}
            onChange={(e) => setFeedbackCategory(e.target.value as any)}
          >
            <option value="bug">Bug Report</option>
            <option value="feature">Feature Request</option>
            <option value="improvement">Improvement Suggestion</option>
            <option value="question">Question</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <textarea 
          className="w-full border border-base-200 rounded px-3 py-2 min-h-[120px] text-base focus:ring-1 focus:ring-primary/30 transition-all" 
          placeholder="Your suggestions or bug reports..."
          value={feedbackMessage}
          onChange={(e) => setFeedbackMessage(e.target.value)}
        />
        
        <div className="mt-2 flex items-center justify-between">
          <div className="text-xs text-base-content/60">
            Limited to 5 submissions per day
          </div>
          <Button 
            onClick={handleSubmitFeedback} 
            disabled={isSubmitting || !feedbackMessage.trim()}
            className="relative"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            {isSubmitting && (
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [active, setActive] = useState('profile');
  return (
    <div className="h-full w-full bg-gradient-to-br from-base-100 via-base-50 to-base-200 flex relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-accent/10 to-transparent rounded-full blur-3xl" />
      
      <SectionSidebar active={active} setActive={setActive} />
      <main className="flex-1 flex flex-col h-full w-full overflow-hidden relative z-10">
        <AnimatePresence mode="wait">
          {active === 'profile' && (
            <motion.section 
              key="profile" 
              initial={{ opacity: 0, x: 40 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -40 }} 
              transition={{ duration: 0.4, ease: "easeOut" }} 
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
              transition={{ duration: 0.4, ease: "easeOut" }} 
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
              transition={{ duration: 0.4, ease: "easeOut" }} 
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
              transition={{ duration: 0.4, ease: "easeOut" }} 
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
              transition={{ duration: 0.4, ease: "easeOut" }} 
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