import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useParams, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Github, 
  Linkedin, 
  Twitter,
  Flame,
  Code,
  BookOpen,
  Hammer,
  MapPin,
  Mail,
  School,
  Award,
  Star,
  GraduationCap,
  TrendingUp,
  Zap,
  Trophy,
  Users,
  Sparkles,
  Globe,
  User,
  Lock,
  Target,
  Bookmark,
  ChevronRight,
  Eye
} from 'lucide-react';
import { getUserAnalysisHistory, getUserActiveDrafts, getPublicUserAnalysisHistory, getPublicUserActiveDrafts, type IUserAnalysisHistory, type IUserActiveDraft } from '@/lib/profileApi';
import { getBookmarkedResources } from '@/lib/forgeApi';


interface PublicProfile {
  fullName: string;
  username: string;
  profilePicture?: string;
  profile?: {
    headline?: string;
    bio?: string;
    aboutMe?: string;
    location?: string;
    skills?: string[];
    toolsAndTech?: string[];
  };
  socialLinks?: {
    portfolio?: string;
    github?: string;
    linkedin?: string;
    twitter?: string;
  };
  college?: {
    collegeName?: string;
    course?: string;
    branch?: string;
    year?: number;
    city?: string;
    state?: string;
  };
  stats?: {
    problemsSolved: number;
    resourcesCreated: number;
    reputation: number;
    totalBadges: number;
    totalCertificates: number;
    skillMastery: number;
  };
  achievements?: {
    badges: Array<{
      id: string;
      name: string;
      description: string;
      icon: string;
      category: string;
      earnedAt: string;
    }>;
    certificates: Array<{
      id: string;
      name: string;
      issuer: string;
      issueDate: string;
      credentialUrl?: string;
      category: string;
    }>;
    milestones: Array<{
      id: string;
      name: string;
      description: string;
      achievedAt: string;
      category: string;
      value: number;
    }>;
  };
  profileBackground?: {
    type: 'gradient' | 'image';
    value: string;
    name: string;
  };
}

const PublicProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const { getToken } = useAuth();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  // Crucible / Forge state (own profile only)
  const [analysisHistory, setAnalysisHistory] = useState<IUserAnalysisHistory[]>([]);
  const [activeDrafts, setActiveDrafts] = useState<IUserActiveDraft[]>([]);
  const [crucibleLoading, setCrucibleLoading] = useState(false);
  const [crucibleError, setCrucibleError] = useState<string | null>(null);
  const [bookmarkedResources, setBookmarkedResources] = useState<any[]>([]);
  const [forgeLoading, setForgeLoading] = useState(false);
  const [forgeError, setForgeError] = useState<string | null>(null);

  // Derived for achievements/skills UI parity with ProfilePage
  const profileBadges = profile?.achievements?.badges || [];
  const profileCertificates = profile?.achievements?.certificates || [];
  const profileMilestones = profile?.achievements?.milestones || [];
  const skillProgressData = (profile as any)?.profile?.skillProgress || [];

  // Refs for animations
  const containerRef = useRef<HTMLDivElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  // Tab definitions
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'crucible-forge', label: 'Crucible & Forge' },
    { id: 'achievements', label: 'Achievements & Skills' },
  ];

  useEffect(() => {
    const fetchPublicProfile = async () => {
      if (!username) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/users/public/${username}`);
        
        if (!response.ok) {
          if (response.status === 403) {
            setError('This profile is private');
          } else if (response.status === 404) {
            setError('User not found');
          } else {
            setError('Failed to load profile');
          }
          return;
        }
        
        const data = await response.json();
        setProfile(data.data.profile);
      } catch (err) {
        setError('Failed to load profile');
        console.error('Error fetching public profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicProfile();
  }, [username]);

  // Determine if viewing own profile (to allow private Crucible/Forge data fetch)
  useEffect(() => {
    const checkOwnProfile = async () => {
      try {
        const token = await getToken?.();
        if (!token || !username) {
          setIsOwnProfile(false);
          return;
        }
        const backend = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
        const res = await fetch(`${backend}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
          setIsOwnProfile(false);
          return;
        }
        const data = await res.json();
        const currentUsername = (data.data || data)?.username;
        setIsOwnProfile(Boolean(currentUsername && currentUsername === username));
      } catch {
        setIsOwnProfile(false);
      }
    };
    checkOwnProfile();
  }, [username, getToken]);

  // Fetch Crucible and Forge data when combined tab is active
  useEffect(() => {
    const fetchCombinedData = async () => {
      if (activeTab !== 'crucible-forge') return;
      if (crucibleLoading || forgeLoading) return;
      setCrucibleLoading(true);
      setForgeLoading(true);
      setCrucibleError(null);
      setForgeError(null);
      try {
        if (isOwnProfile) {
          const [analyses, drafts, bookmarked] = await Promise.all([
            getUserAnalysisHistory(getToken),
            getUserActiveDrafts(getToken),
            getBookmarkedResources(getToken)
          ]);
          setAnalysisHistory(analyses);
          setActiveDrafts(drafts);
          setBookmarkedResources(bookmarked);
        } else if (username) {
          const [analyses, drafts] = await Promise.all([
            getPublicUserAnalysisHistory(username),
            getPublicUserActiveDrafts(username)
          ]);
          setAnalysisHistory(analyses);
          setActiveDrafts(drafts);
          setBookmarkedResources([]);
        }
      } catch (e) {
        setCrucibleError('Failed to load Crucible data');
        setForgeError('Failed to load Forge data');
        setAnalysisHistory([]);
        setActiveDrafts([]);
        setBookmarkedResources([]);
      } finally {
        setCrucibleLoading(false);
        setForgeLoading(false);
      }
    };
    fetchCombinedData();
  }, [activeTab, isOwnProfile, getToken, username]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-base-content/70">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-100">
        <div className="flex flex-col items-center gap-4 text-center">
          <Lock className="w-16 h-16 text-base-content/30" />
          <h2 className="text-xl font-semibold text-base-content">
            {error === 'This profile is private' ? 'Profile is Private' : 'Profile Not Found'}
          </h2>
          <p className="text-base-content/70 max-w-md">
            {error === 'This profile is private' 
              ? 'This user has made their profile private and it cannot be viewed publicly.'
              : 'The user profile you are looking for could not be found.'
            }
          </p>
          <Button onClick={() => window.history.back()} variant="outline" className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return <Navigate to="/" replace />;
  }

  return (
    <div 
      ref={containerRef} 
      className="min-h-screen relative overflow-hidden bg-base-100 text-base-content z-0"
    >
      {/* Subtle Background Elements - Theme aware using DaisyUI variables */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl bg-primary/10" />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl bg-secondary/10" />
      </div>
      
      {/* Hero Section with Dynamic Background */}
      <section 
        ref={bannerRef}
        className="relative w-full overflow-hidden"
        style={{ 
          aspectRatio: '9 / 1',
          minHeight: '240px',
          background: profile.profileBackground?.type === 'gradient' 
            ? profile.profileBackground.value 
            : undefined
        }}
      >
        {profile.profileBackground?.type === 'image' && (
          <img
            src={profile.profileBackground.value}
            alt="Profile cover"
            className="absolute inset-0 w-full h-full object-cover"
            loading="eager"
            style={{ imageRendering: 'auto' }}
          />
        )}
        {/* Background overlay for better text readability */}
        <div className="absolute inset-0 bg-black/10" />
      </section>

      {/* Profile Information Section - All content below banner */}
      <div className="container mx-auto px-4 relative mt-12">
        <div className="relative flex items-start gap-6 md:gap-8">
          {/* Avatar - Positioned so banner bottom aligns with circle center */}
          <motion.div 
            ref={avatarRef} 
            className="relative inline-block -mt-[125px] ml-3"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {/* Theme-adaptive subtle ring around avatar (light: grey, dark: white) */}
            <div className="absolute inset-0 rounded-full p-[5px] bg-white"></div>
            
            {/* Avatar Image - unified with app avatar */}
            <motion.div className="relative z-10" transition={{ duration: 0.3 }}>
              <Avatar className="w-[160px] h-[160px] ring-2 ring-gray-300 dark:ring-white/80">
                <AvatarImage src={profile.profilePicture || ''} alt={profile.fullName} />
                <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-primary/80 to-accent/80 text-primary-foreground">
                  {profile.fullName.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </motion.div>
          </motion.div>

          {/* Enhanced Name and Title - All content below banner */}
          <div className="flex-1 -mt-12">
            <motion.h1 
              ref={nameRef} 
              className="text-3xl font-bold leading-tight mb-2 text-base-content"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
            >
              {profile.fullName}
              <span className="inline-block ml-2 text-2xl">
                👋
              </span>
            </motion.h1>
            
            <motion.div 
              ref={taglineRef} 
              className="flex flex-wrap gap-2 mb-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              {/* Show bio instead of badges as requested */}
              <motion.span 
                className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-primary/10 text-primary-content border border-primary/20 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.8 }}
                style={{ textShadow: '0 1px 2px rgba(0,0,0,0.15)' }}
              >
                {profile.profile?.bio || profile.profile?.headline || 'ZEMON Developer'}
                <Sparkles className="ml-1 w-3 h-3" />
              </motion.span>
            </motion.div>

            {/* Quick Stats Bar */}
            <motion.div 
              className="flex items-center gap-4 md:gap-6 text-sm text-base-content/70"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
            >
              <div className="flex items-center gap-1">
                <Flame className="w-4 h-4 text-accent" />
                <span className="font-semibold">
                  {profile.stats?.problemsSolved || 0} problems solved
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-warning" />
                <span className="font-semibold">{profile.stats?.reputation || 0} reputation</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4 text-info" />
                <span className="font-semibold">Public Profile</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
            
      {/* Enhanced Tab Navigation */}
      <div className="container mx-auto px-4 mt-8">
        <motion.div 
          className="relative p-1 rounded-xl shadow-md bg-base-200 border border-base-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.1 }}
        >
          <div className="flex flex-wrap gap-1 relative">
            {tabs.map((tab, index) => (
              <motion.button
                key={tab.id}
                className={`relative px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary z-10
                  ${activeTab === tab.id 
                    ? 'text-primary-content shadow-sm' 
                    : 'text-base-content hover:bg-base-300'
                  }`}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 1.2 + index * 0.1 }}
              >
                {activeTab === tab.id && (
                  <motion.div
                    className="absolute inset-0 rounded-lg bg-primary"
                    layoutId="activeTab"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Enhanced Tab Content */}
      <div className="container mx-auto px-4 mt-6 max-w-full">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div 
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10"
            >
              {/* Main content - 2/3 width on desktop */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                {/* Enhanced About Card */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  <Card className="overflow-hidden shadow-[0_6px_24px_-6px_rgba(0,0,0,0.15)] rounded-2xl border border-base-300/70 bg-gradient-to-b from-base-100 to-base-200/40 backdrop-blur">
                    <CardContent className="p-6 md:p-7">
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-content flex items-center justify-center shadow-sm ring-1 ring-white/10">
                            <User className="w-4.5 h-4.5" />
                          </div>
                          <h2 className="text-xl md:text-[1.35rem] font-semibold tracking-tight">About</h2>
                        </div>
                        <Badge variant="outline" className="rounded-full bg-white/5 border-base-300/60 text-xs">Public Profile</Badge>
                      </div>

                      <p className="mb-6 text-[0.975rem] leading-7 text-base-content/80">
                        {profile.profile?.aboutMe || profile.profile?.bio || 'This developer is building amazing things on ZEMON!'}
                      </p>

                      {/* Skills */}
                      <div className="space-y-3">
                        <h3 className="text-base font-semibold flex items-center gap-2 text-base-content">
                          <Zap className="w-5 h-5 text-warning" />
                          Skills & Technologies
                        </h3>
                        <div className="flex flex-wrap gap-2.5">
                          {(profile.profile?.skills || []).map((skill, index) => (
                            <motion.span
                              key={index}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-base-100/70 backdrop-blur ring-1 ring-base-300/60 hover:ring-primary/30 transition-colors shadow-sm"
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.25, delay: 0.15 + index * 0.03 }}
                            >
                              <span className="i-lucide-sparkles w-3.5 h-3.5" />{skill}
                            </motion.span>
                          ))}
                          {(profile.profile?.toolsAndTech || []).map((tech, index) => (
                            <motion.span
                              key={`tech-${index}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-base-100/70 backdrop-blur ring-1 ring-base-300/60 hover:ring-secondary/30 transition-colors shadow-sm"
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.25, delay: 0.2 + (profile.profile?.skills?.length || 0 + index) * 0.03 }}
                            >
                              <span className="i-lucide-cpu w-3.5 h-3.5" />{tech}
                            </motion.span>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Premium Stats Section */}
                <motion.div 
                  ref={statsRef}
                  className="grid grid-cols-2 md:grid-cols-4 gap-4"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  {[
                    { icon: Flame, value: profile.stats?.problemsSolved || 0, label: 'Problems Solved' },
                    { icon: Code, value: profile.stats?.reputation || 0, label: 'Reputation' },
                    { icon: BookOpen, value: profile.stats?.totalBadges || 0, label: 'Badges Earned' },
                    { icon: Hammer, value: profile.stats?.skillMastery || 0, label: 'Skill Mastery %' }
                  ].map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.45, delay: 0.15 + index * 0.08 }}
                    >
                      <Card className="overflow-hidden rounded-xl border border-base-300/70 bg-base-100/70 backdrop-blur shadow-[0_4px_18px_-6px_rgba(0,0,0,0.12)] hover:shadow-[0_10px_28px_-8px_rgba(0,0,0,0.18)] transition-shadow">
                        <CardContent className="p-4 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/90 to-secondary/90 flex items-center justify-center text-primary-content ring-1 ring-white/10">
                            <stat.icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xl font-bold leading-6 truncate">{stat.value}</div>
                            <div className="text-[11px] tracking-wide text-base-content/60 uppercase">{stat.label}</div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
              
              {/* Enhanced Sidebar - 1/3 width on desktop */}
              <div className="flex flex-col gap-6">
                {/* Contact Info Card */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <Card className="overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 rounded-xl border border-base-300 bg-base-100">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-accent rounded-md flex items-center justify-center">
                          <Mail className="w-4 h-4 text-accent-content" />
                        </div>
                        <h2 className="text-xl font-semibold text-base-content">Contact Info</h2>
                      </div>
                      
                      <div className="space-y-4">
                        {profile.college?.collegeName && (
                          <div className="flex items-center gap-4 p-3 rounded-lg transition-all duration-200 cursor-pointer bg-base-200 hover:bg-base-300">
                            <div className="w-9 h-9 bg-primary rounded-md flex items-center justify-center">
                              <School className="w-4 h-4 text-primary-content" />
                            </div>
                            <div>
                              <p className="font-semibold text-base-content">
                                {profile.college.course || 'Student'}
                                {profile.college.branch && ` - ${profile.college.branch}`}
                              </p>
                              <p className="text-sm text-base-content/70">
                                {profile.college.collegeName}
                                {profile.college.city && profile.college.state && `, ${profile.college.city}, ${profile.college.state}`}
                              </p>
                            </div>
                          </div>
                        )}
                        
                        {profile.profile?.location && (
                          <div className="flex items-center gap-4 p-3 rounded-lg transition-all duration-200 cursor-pointer bg-base-200 hover:bg-base-300">
                            <div className="w-9 h-9 bg-secondary rounded-md flex items-center justify-center">
                              <MapPin className="w-4 h-4 text-secondary-content" />
                            </div>
                            <span className="font-medium text-base-content">{profile.profile.location}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Enhanced Social Links */}
                      <div className="flex gap-3 mt-6">
                        {[
                          { icon: Github, href: profile.socialLinks?.github, color: "btn-primary", label: "GitHub" },
                          { icon: Linkedin, href: profile.socialLinks?.linkedin, color: "btn-secondary", label: "LinkedIn" },
                          { icon: Twitter, href: profile.socialLinks?.twitter, color: "btn-accent", label: "Twitter" },
                          { icon: Globe, href: profile.socialLinks?.portfolio, color: "btn-info", label: "Portfolio" }
                        ].map((social, index) => (
                          social.href && (
                            <a
                              key={index}
                              href={social.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`btn btn-sm ${social.color} transition-all duration-200 hover:scale-105`}
                              title={`Visit ${social.label}`}
                            >
                              <social.icon className="w-4 h-4" />
                            </a>
                          )
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </motion.div>
          )}

          {activeTab === 'crucible-forge' && (
            <motion.div 
              key="crucible-forge"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="w-full mb-10"
            >
              {!isOwnProfile ? (
                <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="mb-6"
              >
                <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-content flex items-center justify-center shadow-sm ring-1 ring-white/10">
                          <Hammer className="w-5 h-5" />
                        </div>
                  <div>
                          <h2 className="text-2xl font-bold text-base-content mb-1">Crucible & Forge</h2>
                          <p className="text-base-content/70 text-sm">Public coding activity and resources</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="rounded-full bg-white/5 border-base-300/60 text-xs">Solutions {profile.stats?.problemsSolved || 0}</Badge>
                        <Badge variant="outline" className="rounded-full bg-white/5 border-base-300/60 text-xs">Resources {profile.stats?.resourcesCreated || 0}</Badge>
                  </div>
                </div>
              </motion.div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="overflow-hidden rounded-2xl border border-base-300/70 bg-gradient-to-b from-base-100 to-base-200/40 backdrop-blur shadow-[0_6px_24px_-6px_rgba(0,0,0,0.15)] lg:col-span-2">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-sm">
                              <Target className="w-4.5 h-4.5" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold">Crucible Activity</h3>
                              <p className="text-sm text-base-content/70">Recent public milestones</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="rounded-full bg-white/5 border-base-300/60 text-xs">Total {profile.stats?.problemsSolved || 0}</Badge>
                        </div>

                        {crucibleError ? (
                          <div className="text-sm text-error/90 rounded-lg border border-error/20 bg-error/5 p-3">Failed to load solutions</div>
                        ) : analysisHistory.length === 0 ? (
                          <div className="text-sm text-base-content/60 rounded-lg border border-base-300/60 bg-base-100/70 p-3">No solutions yet</div>
                        ) : (
                          <div className="divide-y divide-base-300/60 rounded-xl border border-base-300/60 bg-base-100/70">
                            {analysisHistory.slice(0, 5).map((analysis, index) => (
                              <div key={analysis._id || index} className="w-full text-left px-4 py-3 hover:bg-base-200/60 transition-colors flex items-center gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500/80" />
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium truncate">{analysis.problemId.title}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="overflow-hidden rounded-2xl border border-base-300/70 bg-gradient-to-b from-base-100 to-base-200/40 backdrop-blur">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-sm">
                              <Bookmark className="w-4.5 h-4.5" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold">Forge Resources</h3>
                              <p className="text-sm text-base-content/70">Created or featured</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="rounded-full bg-white/5 border-base-300/60 text-xs">Total {profile.stats?.resourcesCreated || 0}</Badge>
                        </div>

                        <div className="text-sm text-base-content/60 rounded-lg border border-base-300/60 bg-base-100/70 p-4">Bookmarks are private</div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              ) : (
                <>
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.05 }}
                    className="mb-6"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-[1.6rem] font-semibold tracking-tight">Workspace</h2>
                        <p className="text-base-content/70 text-sm">Your coding activity and saved resources</p>
                        </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="rounded-full bg-white/5 border-base-300/60 text-xs">Solutions {analysisHistory.length}</Badge>
                        <Badge variant="outline" className="rounded-full bg-white/5 border-base-300/60 text-xs">Drafts {activeDrafts.length}</Badge>
                        <Badge variant="outline" className="rounded-full bg-white/5 border-base-300/60 text-xs">Bookmarks {bookmarkedResources.length}</Badge>
                        </div>
                      </div>
                  </motion.div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.45, delay: 0.1 }}
                      className="space-y-6"
                    >
                      <Card className="overflow-hidden shadow-[0_6px_24px_-6px_rgba(0,0,0,0.12)] rounded-2xl border border-base-300/70 bg-base-100/80 backdrop-blur">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center ring-1 ring-white/10">
                                <Target className="w-5 h-5" />
                              </div>
                              <h3 className="text-lg font-semibold">Crucible</h3>
                              </div>
                            {(crucibleLoading) && (
                              <div className="flex items-center gap-2 px-2.5 py-1 text-xs rounded-full bg-base-200">
                                <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-primary border-t-transparent" />
                                Loading
                            </div>
                            )}
                          </div>

                          <div className="mb-4">
                            <div className="text-xs uppercase tracking-wide text-base-content/50 mb-2">Solution Journeys</div>
                            {crucibleError ? (
                              <div className="text-sm text-error/90 rounded-lg border border-error/20 bg-error/5 p-3">Failed to load solutions</div>
                            ) : analysisHistory.length === 0 ? (
                              <div className="text-sm text-base-content/60 rounded-lg border border-base-300/60 bg-base-100/70 p-3">No solutions yet</div>
                            ) : (
                              <div className="divide-y divide-base-300/60 rounded-xl border border-base-300/60 bg-base-100/70">
                                {analysisHistory.slice(0, 5).map((analysis, index) => (
                                  <div
                                    key={analysis._id || index}
                                    className="w-full text-left px-4 py-3 hover:bg-base-200/60 transition-colors flex items-center gap-3"
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary/80" />
                                    <span className="flex-1 truncate text-sm font-medium">{analysis.problemId.title}</span>
                                    <ChevronRight className="w-4 h-4 text-base-content/50" />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <div>
                            <div className="text-xs uppercase tracking-wide text-base-content/50 mb-2">Active Drafts</div>
                            {crucibleError ? (
                              <div className="text-sm text-error/90 rounded-lg border border-error/20 bg-error/5 p-3">Failed to load drafts</div>
                            ) : activeDrafts.length === 0 ? (
                              <div className="text-sm text-base-content/60 rounded-lg border border-base-300/60 bg-base-100/70 p-3">No active drafts</div>
                            ) : (
                              <div className="divide-y divide-base-300/60 rounded-xl border border-base-300/60 bg-base-100/70">
                                {activeDrafts.slice(0, 5).map((draft, index) => (
                                  <div
                                    key={draft._id || index}
                                    className="w-full text-left px-4 py-3 hover:bg-base-200/60 transition-colors flex items-center gap-3"
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-secondary/80" />
                                    <span className="flex-1 truncate text-sm font-medium">{draft.problemId.title}</span>
                                    <ChevronRight className="w-4 h-4 text-base-content/50" />
                                  </div>
                                ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.45, delay: 0.15 }}
                      className="space-y-6"
                    >
                      <Card className="overflow-hidden shadow-[0_6px_24px_-6px_rgba(0,0,0,0.12)] rounded-2xl border border-base-300/70 bg-base-100/80 backdrop-blur">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 text-white flex items-center justify-center ring-1 ring-white/10">
                                <Bookmark className="w-5 h-5" />
                              </div>
                              <h3 className="text-lg font-semibold">Bookmarked Resources</h3>
                            </div>
                            {(forgeLoading) && (
                              <div className="flex items-center gap-2 px-2.5 py-1 text-xs rounded-full bg-base-200">
                                <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-primary border-t-transparent" />
                                Loading
                              </div>
                            )}
                          </div>

                          {forgeError ? (
                            <div className="text-sm text-error/90 rounded-lg border border-error/20 bg-error/5 p-3">Failed to load resources</div>
                          ) : bookmarkedResources.length === 0 ? (
                            <div className="text-sm text-base-content/60 rounded-lg border border-base-300/60 bg-base-100/70 p-3">No bookmarks yet</div>
                          ) : (
                            <div className="divide-y divide-base-300/60 rounded-xl border border-base-300/60 bg-base-100/70">
                              {bookmarkedResources.slice(0, 6).map((resource: any, index) => (
                                <div key={resource._id || index} className="px-4 py-3 flex items-center gap-3">
                                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500/80" />
                                  <span className="flex-1 truncate text-sm font-medium">{resource.title || resource.name || 'Untitled Resource'}</span>
                                  <div className="flex items-center gap-2 text-base-content/50">
                                    <Eye className="w-4 h-4" />
                                    <span className="text-xs">{Math.floor(Math.random() * 200) + 50}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      <Card className="overflow-hidden shadow-[0_6px_24px_-6px_rgba(0,0,0,0.12)] rounded-2xl border border-base-300/70 bg-base-100/80 backdrop-blur">
                        <CardContent className="p-6">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-xl border border-base-300/60 bg-base-100/70 p-3 text-center">
                              <div className="text-xl font-bold">{analysisHistory.length}</div>
                              <div className="text-[11px] tracking-wide text-base-content/60 uppercase">Solutions</div>
                            </div>
                            <div className="rounded-xl border border-base-300/60 bg-base-100/70 p-3 text-center">
                              <div className="text-xl font-bold">{activeDrafts.length}</div>
                              <div className="text-[11px] tracking-wide text-base-content/60 uppercase">Drafts</div>
                            </div>
                            <div className="rounded-xl border border-base-300/60 bg-base-100/70 p-3 text-center">
                              <div className="text-xl font-bold">{bookmarkedResources.length}</div>
                              <div className="text-[11px] tracking-wide text-base-content/60 uppercase">Resources</div>
                            </div>
                            <div className="rounded-xl border border-base-300/60 bg-base-100/70 p-3 text-center">
                              <div className="text-xl font-bold">{Math.floor((analysisHistory.length + activeDrafts.length + bookmarkedResources.length) / 3)}</div>
                              <div className="text-[11px] tracking-wide text-base-content/60 uppercase">Avg</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {activeTab === 'achievements' && (
            <motion.div 
              key="achievements"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="w-full space-y-8 mb-10"
            >
              {/* Achievements & Recognition - parity with ProfilePage */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <Card className="overflow-hidden shadow-[0_6px_24px_-6px_rgba(0,0,0,0.15)] rounded-2xl border border-base-300/70 bg-gradient-to-b from-base-100 to-base-200/40 backdrop-blur">
                  <CardContent className="p-6 md:p-7">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-warning rounded-xl flex items-center justify-center text-warning-content ring-1 ring-white/10">
                          <Trophy className="w-5 h-5" />
                        </div>
                        <h2 className="text-2xl font-semibold tracking-tight">Achievements & Recognition</h2>
                        </div>
                      <Badge variant="outline" className="rounded-full bg-white/5 border-base-300/60 text-xs">Public</Badge>
                      </div>
                      
                    {/* Summary strip */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      <div className="rounded-xl border border-base-300/60 bg-base-100/70 p-3 flex items-center gap-3 shadow-sm">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-warning to-amber-500 text-white flex items-center justify-center">
                          <Award className="w-4 h-4" />
                              </div>
                        <div>
                          <div className="text-lg font-bold leading-5">{profileBadges.length}</div>
                          <div className="text-[11px] tracking-wide text-base-content/60 uppercase">Badges</div>
                              </div>
                            </div>
                      <div className="rounded-xl border border-base-300/60 bg-base-100/70 p-3 flex items-center gap-3 shadow-sm">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center">
                          <GraduationCap className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-lg font-bold leading-5">{profileCertificates.length}</div>
                          <div className="text-[11px] tracking-wide text-base-content/60 uppercase">Certificates</div>
                        </div>
                      </div>
                      <div className="rounded-xl border border-base-300/60 bg-base-100/70 p-3 flex items-center gap-3 shadow-sm">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center">
                          <TrendingUp className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-lg font-bold leading-5">{profile?.stats?.skillMastery ?? 0}%</div>
                          <div className="text-[11px] tracking-wide text-base-content/60 uppercase">Skill Mastery</div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Badges */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2 text-base-content">
                          <Award className="w-5 h-5 text-warning" />
                          Badges
                        </h3>
                        {profileBadges.length === 0 ? (
                          <div className="text-sm text-base-content/60">No badges yet</div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {profileBadges.map((badge, index) => (
                              <motion.div
                                key={badge.id || index}
                                className="flex items-center gap-3 rounded-xl border border-base-300/60 bg-base-100/70 p-3 shadow-sm hover:border-warning/40 transition-colors"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.35, delay: 0.08 + index * 0.04 }}
                              >
                                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center text-base">
                                  <span aria-hidden>{(badge as any).icon || '⭐'}</span>
                          </div>
                                <div className="min-w-0">
                                  <div className="font-medium leading-tight truncate">{badge.name}</div>
                                  {badge.description && (
                                    <div className="text-xs text-base-content/60 truncate">{badge.description}</div>
                        )}
                      </div>
                </motion.div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Milestones timeline */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2 text-base-content">
                          <Target className="w-5 h-5 text-info" />
                          Milestones
                        </h3>
                        {profileMilestones.length === 0 ? (
                          <div className="text-sm text-base-content/60">No milestones yet</div>
                        ) : (
                          <div className="relative pl-4">
                            <div className="absolute left-1 top-0 bottom-0 w-px bg-base-300/70" />
                            <div className="space-y-3">
                              {profileMilestones.map((m, index) => (
                <motion.div
                                  key={m.id || index}
                                  className="relative rounded-xl border border-base-300/60 bg-base-100/70 p-3 shadow-sm"
                                  initial={{ opacity: 0, x: 10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ duration: 0.35, delay: 0.1 + index * 0.05 }}
                                >
                                  <div className="absolute -left-[9px] top-4 w-2.5 h-2.5 rounded-full bg-info ring-4 ring-info/15" />
                                  <div className="flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                      <div className="font-medium leading-tight truncate">{m.name}</div>
                                      {m.description && (
                                        <div className="text-xs text-base-content/60 truncate">{m.description}</div>
                                      )}
                                    </div>
                                    <Badge variant="outline" className="text-[10px] rounded-full capitalize">{m.category}</Badge>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Certificates */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2 text-base-content">
                          <GraduationCap className="w-5 h-5 text-success" />
                          Certificates
                        </h3>
                        {profileCertificates.length === 0 ? (
                          <div className="text-sm text-base-content/60">No certificates yet</div>
                        ) : (
                          <div className="space-y-2">
                            {profileCertificates.map((cert, index) => (
                              <motion.div
                                key={cert.id || index}
                                className="group block rounded-xl border border-base-300/60 bg-base-100/70 p-3 shadow-sm hover:border-success/40 transition-colors"
                                initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.35, delay: 0.08 + index * 0.04 }}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="min-w-0">
                                    <div className="font-medium leading-tight truncate">{cert.name}</div>
                                    <div className="text-xs text-base-content/60 truncate">{cert.issuer}</div>
                        </div>
                        </div>
                              </motion.div>
                            ))}
                      </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Skills in Progress - parity layout; show public skills if no progress */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="overflow-hidden shadow-[0_6px_24px_-6px_rgba(0,0,0,0.15)] rounded-2xl border border-base-300/70 bg-gradient-to-b from-base-100 to-base-200/40 backdrop-blur">
                  <CardContent className="p-6 md:p-7">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-content ring-1 ring-white/10">
                          <TrendingUp className="w-5 h-5" />
                              </div>
                        <h2 className="text-2xl font-semibold tracking-tight">Skills in Progress</h2>
                              </div>
                      <Badge variant="outline" className="rounded-full bg-white/5 border-base-300/60 text-xs">{profile?.stats?.skillMastery ?? 0}% avg</Badge>
                            </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h3 className="text-base font-semibold text-base-content mb-3">Currently Learning</h3>
                        <div className="flex flex-wrap gap-2.5">
                          {(profile.profile?.skills || []).length === 0 ? (
                            <span className="text-sm text-base-content/60">No skills listed</span>
                          ) : (
                            (profile.profile?.skills || []).map((skill, index) => (
                              <motion.span
                                key={skill || index}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-base-100/70 backdrop-blur ring-1 ring-base-300/60 shadow-sm"
                                whileHover={{ scale: 1.05, y: -2 }}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.25, delay: 0.15 + index * 0.05 }}
                              >
                                {skill}
                              </motion.span>
                            ))
                          )}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-base-content mb-3">Progress</h3>
                        <div className="space-y-4">
                          {skillProgressData.length === 0 ? (
                            <span className="text-sm text-base-content/60">No progress to show</span>
                          ) : (
                            skillProgressData.map((sp: any, index: number) => (
                              <motion.div
                                key={sp.skill || index}
                                className="space-y-2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 + index * 0.08 }}
                              >
                                <div className="flex justify-between items-center">
                                  <span className="font-medium text-base-content">{sp.skill}</span>
                                  <span className="text-sm font-semibold text-primary">{sp.progress}%</span>
                          </div>
                                <div className="w-full h-3 rounded-full bg-gradient-to-r from-base-300 to-base-200 overflow-hidden">
                                  <motion.div
                                    className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${sp.progress}%` }}
                                    transition={{ duration: 0.9, delay: 0.3 + index * 0.1, ease: 'easeOut' }}
                                    style={{ width: `${sp.progress}%` }}
                                  />
                                </div>
                              </motion.div>
                            ))
                          )}
                        </div>
                      </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PublicProfilePage;
