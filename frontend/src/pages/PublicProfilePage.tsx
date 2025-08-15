import { useState, useRef, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Github, 
  Linkedin, 
  Twitter, 
  ExternalLink,
  Flame,
  Code,
  BookOpen,
  Hammer,
  MapPin,
  Mail,
  School,
  Coffee,
  GraduationCap,
  Award,
  Star,
  TrendingUp,
  Zap,
  Target,
  Brain,
  Lightbulb,
  Rocket,
  Trophy,
  Clock,
  Users,
  Heart,
  Eye,
  MessageCircle,
  Bookmark,
  ChevronRight,
  Sparkles,
  Globe,
  User,
  Palette,
  Lock
} from 'lucide-react';
import { formatEducation, formatCollegeLocation, getDisplayName, getDisplayBio, getDisplayLocation, getSkills, getToolsAndTech, getSocialLinks } from '@/hooks/useUserProfile';

interface PublicProfile {
  fullName: string;
  username: string;
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
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

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
            
            {/* Avatar Image */}
            <motion.img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile.fullName)}&background=random&size=160&rounded=true`}
              alt="Profile"
              className="w-[160px] h-[160px] rounded-full relative z-10 object-cover ring-2 ring-gray-300 dark:ring-white/80"
              transition={{ duration: 0.3 }}
            />
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

          {activeTab === 'achievements' && (
            <motion.div 
              key="achievements"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="w-full mb-10"
            >
              {/* Enhanced Header Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="mb-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-base-content mb-2">Achievements & Skills</h2>
                    <p className="text-base-content/70">Badges, certificates, and skill progress</p>
                  </div>
                </div>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* Badges Section */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  <Card className="overflow-hidden shadow-lg transition-all duration-300 rounded-xl border border-base-300 bg-base-100 group cursor-pointer h-full relative">
                    <CardContent className="p-6 h-full flex flex-col relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center transition-transform duration-300 shadow-lg">
                          <Trophy className="w-6 h-6 text-primary-content" />
                        </div>
                        <div className="flex-1">
                          <h2 className="text-xl font-bold text-base-content transition-colors duration-300">Badges</h2>
                          <p className="text-sm text-base-content/70">Achievements earned</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3 flex-1">
                        {profile.achievements?.badges && profile.achievements.badges.length > 0 ? (
                          profile.achievements.badges.slice(0, 3).map((badge, index) => (
                            <div key={badge.id} className="flex items-center gap-3 p-3 rounded-lg bg-base-200 hover:bg-base-300 transition-all duration-300">
                              <div className="w-8 h-8 bg-warning/20 rounded-lg flex items-center justify-center">
                                <span className="text-lg">{badge.icon}</span>
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-base-content">{badge.name}</p>
                                <p className="text-xs text-base-content/50">{badge.description}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="flex flex-col items-center justify-center py-8 text-center">
                            <Trophy className="w-12 h-12 text-base-content/30 mb-3" />
                            <p className="text-base-content/60 font-medium">No badges yet</p>
                            <p className="text-sm text-base-content/40">Keep solving problems to earn badges!</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Certificates Section */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <Card className="overflow-hidden shadow-lg transition-all duration-300 rounded-xl border border-base-300 bg-base-100 group cursor-pointer h-full relative">
                    <CardContent className="p-6 h-full flex flex-col relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center transition-transform duration-300 shadow-lg">
                          <Award className="w-6 h-6 text-secondary-content" />
                        </div>
                        <div className="flex-1">
                          <h2 className="text-xl font-bold text-base-content transition-colors duration-300">Certificates</h2>
                          <p className="text-sm text-base-content/70">Professional achievements</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3 flex-1">
                        {profile.achievements?.certificates && profile.achievements.certificates.length > 0 ? (
                          profile.achievements.certificates.slice(0, 3).map((cert, index) => (
                            <div key={cert.id} className="flex items-center gap-3 p-3 rounded-lg bg-base-200 hover:bg-base-300 transition-all duration-300">
                              <div className="w-8 h-8 bg-secondary/20 rounded-lg flex items-center justify-center">
                                <Award className="w-4 h-4 text-secondary" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-base-content">{cert.name}</p>
                                <p className="text-xs text-base-content/50">{cert.issuer}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="flex flex-col items-center justify-center py-8 text-center">
                            <Award className="w-12 h-12 text-base-content/30 mb-3" />
                            <p className="text-base-content/60 font-medium">No certificates yet</p>
                            <p className="text-sm text-base-content/40">Add your professional certifications!</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Skills Progress Section */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <Card className="overflow-hidden shadow-lg transition-all duration-300 rounded-xl border border-base-300 bg-base-100 group cursor-pointer h-full relative">
                    <CardContent className="p-6 h-full flex flex-col relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center transition-transform duration-300 shadow-lg">
                          <Brain className="w-6 h-6 text-accent-content" />
                        </div>
                        <div className="flex-1">
                          <h2 className="text-xl font-bold text-base-content transition-colors duration-300">Skills</h2>
                          <p className="text-sm text-base-content/70">Technologies mastered</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3 flex-1">
                        {profile.profile?.skills && profile.profile.skills.length > 0 ? (
                          profile.profile.skills.slice(0, 4).map((skill, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-base-200 hover:bg-base-300 transition-all duration-300">
                              <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center">
                                <Zap className="w-4 h-4 text-accent" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-base-content">{skill}</p>
                                <p className="text-xs text-base-content/50">Skill mastered</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="flex flex-col items-center justify-center py-8 text-center">
                            <Brain className="w-12 h-12 text-base-content/30 mb-3" />
                            <p className="text-base-content/60 font-medium">No skills listed</p>
                            <p className="text-sm text-base-content/40">Skills will appear here</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PublicProfilePage;
