import { useState, useRef, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import BackgroundSelector, { BackgroundOption, gradientOptions } from '@/components/ui/background-selector';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserProfile, formatEducation, formatCollegeLocation, getDisplayName, getDisplayBio, getDisplayLocation, getSkills, getToolsAndTech, getSocialLinks } from '@/hooks/useUserProfile';
import { getUserAnalysisHistory, getUserActiveDrafts, IUserAnalysisHistory, IUserActiveDraft } from '@/lib/profileApi';
import { getBookmarkedResources } from '@/lib/forgeApi';
import { useZemonStreak } from '@/hooks/useZemonStreak';
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
  Palette
} from 'lucide-react';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Mock data - keep for other tabs that aren't implemented yet
const mockUserData = {
  name: "Aarav Sharma",
  title: "2nd-Year CSE @ MAIT | System Design·AI/ML·Web Dev",
  bio: "Passionate about building scalable systems and exploring the intersection of AI and web technologies. Currently focused on distributed systems and machine learning applications.",
  location: "New Delhi, India",
  email: "aarav.sharma@example.com",
  education: "B.Tech in Computer Science",
  skills: ["React", "Node.js", "Python", "TensorFlow", "AWS", "System Design", "TypeScript", "MongoDB"],
  stats: {
    zemonStreak: 12,
    githubStreak: 15,
    crucibleSolutions: 8,
    forgeContributions: 5
  },
  projects: [
    {
      title: "Distributed Cache System",
      image: "/project1.jpg",
      tech: ["Redis", "Node.js", "Docker"],
      description: "Built a distributed caching system with Redis and Node.js"
    },
    {
      title: "ML Pipeline Automation",
      image: "/project2.jpg",
      tech: ["Python", "TensorFlow", "AWS"],
      description: "Automated ML model training and deployment pipeline"
    },
    {
      title: "Real-time Analytics Dashboard",
      image: "/project3.jpg",
      tech: ["React", "WebSocket", "D3.js"],
      description: "Built real-time analytics dashboard with WebSocket"
    }
  ],
  testimonials: [
    {
      name: "Priya Patel",
      role: "Senior Software Engineer",
      photo: "/testimonial1.jpg",
      quote: "Aarav's attention to system design principles is impressive."
    },
    {
      name: "Rahul Kumar",
      role: "Tech Lead",
      photo: "/testimonial2.jpg",
      quote: "Great problem-solving skills and clean code practices."
    }
  ],
  certifications: [
    {
      year: 2023,
      title: "AWS Solutions Architect",
      link: "#"
    },
    {
      year: 2023,
      title: "TensorFlow Developer Certificate",
      link: "#"
    }
  ],
  crucible: {
    solutionJourneys: ["Distributed Cache System", "ML Pipeline Automation"],
    drafts: ["Distributed Cache System", "ML Pipeline Automation"],
    notes: ["System Design Principles", "AWS Architecture"],
    diagrams: ["System Architecture", "Data Flow"]
  },
  arena: {
    projects: ["Distributed Cache System", "ML Pipeline Automation"],
    collaboration: ["Open Source Projects", "Hackathons"],
    feedback: ["Code Reviews", "Pair Programming"],
    hackathons: ["Zemon Hackathon", "MAIT Hackathon"]
  },
  forge: {
    createdResources: ["System Design Patterns", "AWS Best Practices"],
    bookmarkedResources: ["Books on System Design", "AWS Documentation"],
    reviews: ["Code Review", "Architecture Review"]
  },
  achievements: {
    badges: ["AWS Certified", "TensorFlow Developer"],
    testimonials: ["Priya Patel", "Rahul Kumar"],
    certs: ["AWS Solutions Architect", "TensorFlow Developer Certificate"]
  },
  skillsInProgress: {
    activeTags: ["React", "Node.js", "Python"],
    progressBars: [
      { skill: "React", percent: 80 },
      { skill: "Node.js", percent: 70 },
      { skill: "Python", percent: 60 }
    ]
  },
  openChallenges: {
    pinnedProblems: ["Distributed Systems", "Machine Learning"],
    dreamProjects: ["AI-Powered Code Review", "Self-Driving Development"]
  },
  innovationJournal: {
    experimentLogs: ["Redis vs Memcached", "ML Model Training"],
    reflections: ["System Design Decisions", "Learning from Mistakes"]
  },
  workspaceHabits: {
    flowPatterns: ["Morning Routine", "Afternoon Break", "Evening Review"],
    toolStack: ["VS Code", "Git", "Docker", "AWS CLI"]
  }
};

export default function ProfilePage() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const { username } = useParams<{ username: string }>();
  const { userProfile, loading, error, refetch } = useUserProfile();
  const [activeTab, setActiveTab] = useState('overview');
  const [currentBackground, setCurrentBackground] = useState<BackgroundOption>(gradientOptions[0]);
  const [isBackgroundSelectorOpen, setIsBackgroundSelectorOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Zemon streak functionality
  const { streakInfo, loading: streakLoading } = useZemonStreak();

  // State for Crucible data
  const [analysisHistory, setAnalysisHistory] = useState<IUserAnalysisHistory[]>([]);
  const [activeDrafts, setActiveDrafts] = useState<IUserActiveDraft[]>([]);
  const [crucibleLoading, setCrucibleLoading] = useState(false);
  const [crucibleError, setCrucibleError] = useState<string | null>(null);

  // State for Forge data
  const [bookmarkedResources, setBookmarkedResources] = useState<any[]>([]);
  const [forgeLoading, setForgeLoading] = useState(false);
  const [forgeError, setForgeError] = useState<string | null>(null);

  // Initialize background from user profile
  useEffect(() => {
    if (userProfile?.profileBackground) {
      const savedBackground: BackgroundOption = {
        id: userProfile.profileBackground.name.toLowerCase().replace(/\s+/g, '-'),
        name: userProfile.profileBackground.name,
        type: userProfile.profileBackground.type,
        value: userProfile.profileBackground.value
      };
      setCurrentBackground(savedBackground);
    }
  }, [userProfile]);

  // Fetch Crucible data when tab is active
  useEffect(() => {
    const fetchCrucibleData = async () => {
      if (activeTab === 'crucible' && getToken && !crucibleLoading) {
        setCrucibleLoading(true);
        setCrucibleError(null);
        
        try {
          const [analyses, drafts] = await Promise.all([
            getUserAnalysisHistory(getToken),
            getUserActiveDrafts(getToken)
          ]);
          
          setAnalysisHistory(analyses);
          setActiveDrafts(drafts);
        } catch (error) {
          console.error('Error fetching Crucible data:', error);
          setCrucibleError('Failed to load Crucible data');
          setAnalysisHistory([]);
          setActiveDrafts([]);
        } finally {
          setCrucibleLoading(false);
        }
      }
    };

    fetchCrucibleData();
  }, [activeTab, getToken]);

  // Fetch Forge data when tab is active
  useEffect(() => {
    const fetchForgeData = async () => {
      if (activeTab === 'forge' && getToken && !forgeLoading) {
        setForgeLoading(true);
        setForgeError(null);
        
        try {
          const bookmarked = await getBookmarkedResources(getToken);
          setBookmarkedResources(bookmarked);
        } catch (error) {
          console.error('Error fetching Forge data:', error);
          setForgeError('Failed to load Forge data');
          setBookmarkedResources([]);
        } finally {
          setForgeLoading(false);
        }
      }
    };

    fetchForgeData();
  }, [activeTab, getToken]);

  // Function to save background to backend
  const saveBackgroundToBackend = async (background: BackgroundOption) => {
    try {
      const response = await fetch('/api/users/me/background', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getToken()}`
        },
        body: JSON.stringify({
          type: background.type,
          value: background.value,
          name: background.name
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save background');
      }

      // Refetch user profile to get updated data
      refetch();
    } catch (error) {
      console.error('Error saving background:', error);
      // You could add a toast notification here
    }
  };

  // Handle background change
  const handleBackgroundChange = (background: BackgroundOption) => {
    setCurrentBackground(background);
    saveBackgroundToBackend(background);
  };

  // Navigation functions for Crucible items
  const handleAnalysisClick = (analysis: IUserAnalysisHistory) => {
    if (username) {
      navigate(`/${username}/crucible/results/${analysis._id}`);
    }
  };

  const handleDraftClick = (draft: IUserActiveDraft) => {
    if (username) {
      navigate(`/${username}/crucible/problem/${draft.problemId._id}`);
    }
  };
  
  // Refs for GSAP animations
  const heroRef = useRef<HTMLElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize GSAP animations
  useGSAP(() => {
    if (!avatarRef.current || !taglineRef.current || !heroRef.current || !statsRef.current || !buttonsRef.current) return;

    // Avatar animation - scale up and fade in
    gsap.fromTo(avatarRef.current,
      { scale: 0.9, opacity: 0, y: 10 },
      { scale: 1, opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 0.2 }
    );

    // Buttons animation
    gsap.fromTo(buttonsRef.current.children,
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out", delay: 0.6 }
    );

    // Name and tagline animations
    const taglineWords = taglineRef.current.children;
    gsap.set([...taglineWords], { opacity: 0, y: 20 });
    gsap.to([...taglineWords], {
      opacity: 1,
      y: 0,
      duration: 0.5,
      stagger: 0.1,
      ease: "power2.out",
      delay: 0.5
    });

    // Stats animation on scroll
    const statElements = statsRef.current.children;
    gsap.from([...statElements], {
      y: 50,
      opacity: 0,
      duration: 0.8,
      stagger: 0.2,
      scrollTrigger: {
        trigger: statsRef.current,
        start: "top center+=100",
        toggleActions: "play none none reverse"
      }
    });
  }, []);



  // Tab definitions
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'crucible', label: 'Crucible' },
    // { id: 'arena', label: 'Arena' }, // HIDDEN
    { id: 'forge', label: 'Forge' },
    { id: 'achievements', label: 'Achievements & Skills' },
    // { id: 'innovation', label: 'Innovation & Workspace' }, // HIDDEN
  ];

  // Loading state
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

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-100">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="text-error text-6xl">⚠️</div>
          <h2 className="text-xl font-semibold text-base-content">Failed to load profile</h2>
          <p className="text-base-content/70 max-w-md">{error}</p>
          <Button onClick={refetch} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
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
        className="relative w-full h-[200px] overflow-hidden"
        style={{ 
          background: currentBackground.type === 'gradient' 
            ? currentBackground.value 
            : `url(${currentBackground.value}) center/cover`
        }}
      >
        {/* Background overlay for better text readability */}
        <div className="absolute inset-0 bg-black/10" />
        
        {/* Background Customization Button */}
        <div className="absolute top-4 right-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsBackgroundSelectorOpen(true)}
            className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30 transition-all duration-300"
          >
            <Palette className="w-4 h-4 mr-2" />
            Customize
          </Button>
        </div>
      </section>

      {/* Profile Information Section - All content below banner */}
      <div className="container mx-auto px-4 relative mt-12">
        <div className="relative flex items-start gap-6 md:gap-8">
          {/* Avatar - Positioned so banner bottom aligns with circle center */}
          <motion.div 
            ref={avatarRef} 
            className="relative inline-block group cursor-pointer -mt-[125px] ml-3"
            whileHover={{ scale: 1.02 }}
            onClick={() => fileInputRef.current?.click()}
          >
            {/* Hidden file input for image upload */}
            <input 
              type="file" 
              ref={fileInputRef}
              className="hidden" 
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    console.log("Image selected for upload:", event.target?.result);
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
            
            {/* LinkedIn-style white border */}
            <div className="absolute inset-0 rounded-full p-[5px] bg-white"></div>
            
            {/* Avatar Image */}
            <motion.img
              src={user?.imageUrl || 'https://via.placeholder.com/200'}
              alt="Profile"
              className="w-[160px] h-[160px] rounded-full relative z-10 object-cover"
              transition={{ duration: 0.3 }}
            />
            
            {/* Change Photo Overlay - Only visible on hover */}
            <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300 z-10">
              <span className="text-white text-sm font-medium">Change Photo</span>
            </div>
            
            {/* Camera icon for photo change - LinkedIn style */}
            <div className="absolute bottom-1 right-1 w-8 h-8 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center shadow-md z-20 cursor-pointer hover:bg-blue-700 transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
            </div>
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
              {getDisplayName(userProfile)}
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
                {getDisplayBio(userProfile)}
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
                  {streakLoading ? '...' : `${streakInfo?.currentStreak || 0} day streak`}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-warning" />
                <span className="font-semibold">4.9 rating</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4 text-info" />
                <span className="font-semibold">1.2k followers</span>
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
                  <Card className="overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 rounded-xl border border-base-300 bg-base-100">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                          <User className="w-4 h-4 text-primary-content" />
                        </div>
                        <h2 className="text-xl font-semibold text-base-content">About Me</h2>
                      </div>
                      <p className="mb-8 text-lg leading-relaxed font-medium text-base-content/80">{userProfile?.profile?.aboutMe || getDisplayBio(userProfile)}</p>
                      
                      {/* Enhanced Skills */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2 text-base-content">
                          <Zap className="w-5 h-5 text-warning" />
                          Skills & Technologies
                        </h3>
                        <div className="flex flex-wrap gap-3">
                          {getSkills(userProfile).map((skill, index) => (
                            <motion.span
                              key={index}
                              className="px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer bg-primary/10 text-primary-content border border-primary/20 hover:bg-primary/20"
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                            >
                              {skill}
                            </motion.span>
                          ))}
                          {getToolsAndTech(userProfile).map((tech, index) => (
                            <motion.span
                              key={`tech-${index}`}
                              className="px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer bg-secondary/10 text-secondary-content border border-secondary/20 hover:bg-secondary/20"
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.3, delay: 0.3 + (getSkills(userProfile).length + index) * 0.05 }}
                            >
                              {tech}
                            </motion.span>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
                {/* Enhanced Stats Section */}
                <motion.div 
                  ref={statsRef}
                  className="grid grid-cols-2 md:grid-cols-4 gap-4"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  {[
                    { icon: Flame, value: streakLoading ? '...' : (streakInfo?.currentStreak || 0), label: "Zemon Streak", color: "bg-indigo-600" },
                    { icon: Code, value: 15, label: "GitHub Streak", color: "bg-blue-600" },
                    { icon: BookOpen, value: 8, label: "Crucible Solutions", color: "bg-indigo-600" },
                    { icon: Hammer, value: 5, label: "Forge Contributions", color: "bg-blue-600" }
                  ].map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                      className="cursor-pointer"
                    >
                      <Card className="overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 rounded-lg border border-base-300 bg-base-100">
                        <CardContent className="p-5 flex flex-col items-center justify-center">
                          <div
                            className={`w-10 h-10 ${
                              index % 2 === 0 ? 'bg-primary' : 'bg-secondary'
                            } rounded-md flex items-center justify-center mb-3`}
                          >
                            <stat.icon className="w-5 h-5 text-primary-content" />
                          </div>
                          <span className="text-2xl font-bold mb-1 text-base-content">
                            {stat.value}
                          </span>
                          <span className="text-xs font-medium text-center text-base-content/70">{stat.label}</span>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Featured Projects Section - HIDDEN */}
                {/* <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <Card className="overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 rounded-xl border border-base-300 bg-base-100">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-secondary rounded-md flex items-center justify-center">
                            <Rocket className="w-4 h-4 text-secondary-content" />
                          </div>
                          <h2 className="text-xl font-semibold text-base-content">Featured Projects</h2>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-2 border-base-300 text-base-content hover:bg-base-200"
                        >
                          View All <ArrowUpRight className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {mockUserData.projects.slice(0, 2).map((project, index) => (
                          <motion.div
                            key={index}
                            className="rounded-lg p-5 transition-all duration-300 cursor-pointer bg-base-200 border border-base-300 hover:border-secondary/30 hover:shadow-md"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                          >
                            <div className="relative z-10">
                              <h3 className="font-bold mb-2 transition-colors duration-300 text-base-content group-hover:text-secondary">{project.title}</h3>
                              <p className="text-sm mb-4 leading-relaxed text-base-content/70">{project.description}</p>
                              <div className="flex flex-wrap gap-2">
                                {project.tech.map((tech, techIndex) => (
                                  <span 
                                    key={techIndex} 
                                    className="px-2 py-1 rounded-lg text-xs font-medium bg-base-300 text-base-content/80"
                                  >
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div> */}
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
                        <div className="flex items-center gap-4 p-3 rounded-lg transition-all duration-200 cursor-pointer bg-base-200 hover:bg-base-300">
                          <div className="w-9 h-9 bg-primary rounded-md flex items-center justify-center">
                            <School className="w-4 h-4 text-primary-content" />
                          </div>
                          <div>
                            <p className="font-semibold text-base-content">{formatEducation(userProfile?.college)}</p>
                            <p className="text-sm text-base-content/70">{formatCollegeLocation(userProfile?.college)}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 p-3 rounded-lg transition-all duration-200 cursor-pointer bg-base-200 hover:bg-base-300">
                          <div className="w-9 h-9 bg-secondary rounded-md flex items-center justify-center">
                            <MapPin className="w-4 h-4 text-secondary-content" />
                          </div>
                          <span className="font-medium text-base-content">{getDisplayLocation(userProfile)}</span>
                        </div>
                        
                        <div className="flex items-center gap-4 p-3 rounded-lg transition-all duration-200 cursor-pointer bg-base-200 hover:bg-base-300">
                          <div className="w-9 h-9 bg-accent rounded-md flex items-center justify-center">
                            <Mail className="w-4 h-4 text-accent-content" />
                          </div>
                          <span className="font-medium text-base-content">{userProfile?.email || 'Email not available'}</span>
                        </div>
                      </div>
                      
                      {/* Enhanced Social Links */}
                      <div className="flex gap-3 mt-6">
                        {[
                          { icon: Github, href: getSocialLinks(userProfile).github, color: "btn-primary", label: "GitHub" },
                          { icon: Linkedin, href: getSocialLinks(userProfile).linkedin, color: "btn-secondary", label: "LinkedIn" },
                          { icon: Twitter, href: getSocialLinks(userProfile).twitter, color: "btn-accent", label: "Twitter" },
                          { icon: Globe, href: getSocialLinks(userProfile).portfolio, color: "btn-info", label: "Portfolio" }
                        ].map((social, index) => (
                          social.href && (
                            <a
                              key={index}
                              href={social.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`btn btn-sm ${social.color} transition-all duration-200 hover:scale-105`}
                              title={`Visit ${social.label}`}
                              onClick={(e) => {
                                // Additional safety check
                                if (social.href && !social.href.startsWith('http://') && !social.href.startsWith('https://')) {
                                  e.preventDefault();
                                  window.open(`https://${social.href}`, '_blank', 'noopener,noreferrer');
                                }
                              }}
                            >
                              <social.icon className="w-4 h-4" />
                            </a>
                          )
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Activity Feed Card - HIDDEN */}
                {/* <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <Card className="overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 rounded-xl border border-base-300 bg-base-100">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-warning rounded-md flex items-center justify-center">
                          <TrendingUp className="w-4 h-4 text-warning-content" />
                        </div>
                        <h2 className="text-xl font-semibold text-base-content">Recent Activity</h2>
                      </div>
                      
                      <div className="space-y-4">
                        {[
                          { action: "Completed", item: "System Design Challenge", time: "2 hours ago", icon: Trophy, color: "bg-warning" },
                          { action: "Contributed to", item: "Open Source Project", time: "1 day ago", icon: Code, color: "bg-success" },
                          { action: "Published", item: "ML Pipeline Guide", time: "3 days ago", icon: BookOpen, color: "bg-info" }
                        ].map((activity, index) => (
                          <motion.div
                            key={index}
                            className="flex items-start gap-3 p-3 rounded-lg bg-base-200 hover:bg-base-300 transition-all duration-300 cursor-pointer group"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                          >
                            <div className={`w-8 h-8 rounded-md ${activity.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                              <activity.icon className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-base-content">
                                <span className="text-base-content/70">{activity.action}</span> {activity.item}
                              </p>
                              <p className="text-xs text-base-content/50 mt-1">{activity.time}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div> */}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {activeTab === 'crucible' && (
          <motion.div 
            key="crucible"
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
                  <h2 className="text-2xl font-bold text-base-content mb-2">Crucible Workspace</h2>
                  <p className="text-base-content/70">Your coding challenges and solution journeys</p>
                </div>
                <div className="flex items-center gap-2">
                  {crucibleLoading && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      <span className="text-sm font-medium">Loading...</span>
                    </div>
                  )}
                  {crucibleError && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-error/10 text-error rounded-lg">
                      <span className="text-sm font-medium">Error loading data</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {[
                { 
                  title: "Solution Journeys", 
                  subtitle: "Completed analyses",
                  items: analysisHistory.map(analysis => analysis.problemId.title),
                  data: analysisHistory,
                  icon: Target, 
                  color: "from-blue-500 to-indigo-600",
                  bg: "from-blue-50 to-indigo-50",
                  onClick: handleAnalysisClick,
                  loading: crucibleLoading,
                  error: crucibleError,
                  emptyMessage: "No solution journeys yet",
                  emptySubtitle: "Complete your first analysis to see it here"
                },
                { 
                  title: "Active Drafts", 
                  subtitle: "Work in progress",
                  items: activeDrafts.map(draft => draft.problemId.title),
                  data: activeDrafts,
                  icon: BookOpen, 
                  color: "from-emerald-500 to-teal-600",
                  bg: "from-emerald-50 to-teal-50",
                  onClick: handleDraftClick,
                  loading: crucibleLoading,
                  error: crucibleError,
                  emptyMessage: "No active drafts",
                  emptySubtitle: "Start a new problem to create your first draft"
                },
                // { 
                //   title: "Research Notes", 
                //   subtitle: "Learning resources",
                //   items: mockUserData.crucible?.notes || [], 
                //   icon: Brain, 
                //   color: "from-purple-500 to-pink-600",
                //   bg: "from-purple-50 to-pink-50",
                //   emptyMessage: "No research notes yet",
                //   emptySubtitle: "Add notes to track your learning"
                // },
                // { 
                //   title: "System Diagrams", 
                //   subtitle: "Visual designs",
                //   items: mockUserData.crucible?.diagrams || [], 
                //   icon: Lightbulb, 
                //   color: "from-amber-500 to-orange-600",
                //   bg: "from-amber-50 to-orange-50",
                //   emptyMessage: "No system diagrams yet",
                //   emptySubtitle: "Create diagrams to visualize your solutions"
                // }
              ].map((section, index) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden shadow-lg transition-all duration-300 rounded-xl border border-base-300 bg-base-100 group cursor-pointer h-full relative">
                    
                    <CardContent className="p-6 h-full flex flex-col relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-12 h-12 ${
                          index % 4 === 0 ? 'bg-primary' : 
                          index % 4 === 1 ? 'bg-secondary' : 
                          index % 4 === 2 ? 'bg-accent' : 'bg-info'
                        } rounded-xl flex items-center justify-center transition-transform duration-300 shadow-lg`}>
                          <section.icon className="w-6 h-6 text-primary-content" />
                        </div>
                        <div className="flex-1">
                          <h2 className="text-xl font-bold text-base-content transition-colors duration-300">{section.title}</h2>
                          <p className="text-sm text-base-content/70">{section.subtitle}</p>
                        </div>
                        {typeof section.onClick === 'function' ? (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <ChevronRight className="w-5 h-5 text-base-content/50 transition-colors duration-300" />
                          </div>
                        ) : null}
                      </div>
                      
                      <div className="space-y-3 flex-1">
                        {/* Enhanced Loading State */}
                        {section.loading && (
                          <motion.div 
                            className="flex flex-col items-center justify-center py-8"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="relative">
                              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                              <div className="absolute inset-0 rounded-full border-2 border-primary/20"></div>
                            </div>
                            <span className="mt-3 text-sm text-base-content/70 font-medium">Loading {section.title.toLowerCase()}...</span>
                          </motion.div>
                        )}
                        
                        {/* Enhanced Error State */}
                        {section.error && !section.loading && (
                          <motion.div 
                            className="flex flex-col items-center justify-center py-8 text-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="w-12 h-12 bg-error/10 rounded-full flex items-center justify-center mb-3">
                              <span className="text-error text-xl">⚠️</span>
                            </div>
                            <span className="text-sm font-medium text-error mb-1">Failed to load</span>
                            <span className="text-xs text-base-content/50">{section.error}</span>
                          </motion.div>
                        )}
                        
                        {/* Enhanced Empty State */}
                        {!section.loading && !section.error && section.items.length === 0 && (
                          <motion.div 
                            className="flex flex-col items-center justify-center py-8 text-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="w-12 h-12 bg-base-300 rounded-full flex items-center justify-center mb-3">
                              <section.icon className="w-6 h-6 text-base-content/50" />
                            </div>
                            <span className="text-sm font-medium text-base-content/70 mb-1">{section.emptyMessage}</span>
                            <span className="text-xs text-base-content/50">{section.emptySubtitle}</span>
                          </motion.div>
                        )}
                        
                        {/* Enhanced Items */}
                        {!section.loading && !section.error && section.items.map((item, itemIndex) => (
                          <motion.div
                            key={itemIndex}
                            className={`flex items-center gap-3 p-4 rounded-lg bg-base-200 transition-all duration-300 group/item ${
                              typeof section.onClick === 'function' ? 'cursor-pointer' : ''
                            }`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: 0.2 + itemIndex * 0.1 }}
                            onClick={() => {
                              if (section.onClick && section.data && section.data[itemIndex]) {
                                // Type assertion to handle different data types
                                section.onClick(section.data[itemIndex] as any);
                              }
                            }}
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <div className={`w-3 h-3 rounded-full transition-transform duration-300 ${
                                index % 4 === 0 ? 'bg-primary' : 
                                index % 4 === 1 ? 'bg-secondary' : 
                                index % 4 === 2 ? 'bg-accent' : 'bg-info'
                              }`} />
                              <span className="text-base-content font-medium transition-colors duration-300">{item}</span>
                            </div>
                            {typeof section.onClick === 'function' ? (
                              <motion.div
                                initial={{ opacity: 0, x: -5 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <ChevronRight className="w-4 h-4 text-base-content/50 transition-all duration-300" />
                              </motion.div>
                            ) : null}
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
        {activeTab === 'arena' && (
          <motion.div 
            key="arena"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="w-full"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { 
                  title: "Showcase Projects", 
                  items: mockUserData.arena?.projects || [], 
                  icon: Rocket, 
                  color: "from-indigo-500 to-purple-600",
                  bg: "from-indigo-50 to-purple-50",
                  description: "Projects shared in the community"
                },
                { 
                  title: "Collaborations", 
                  items: mockUserData.arena?.collaboration || [], 
                  icon: Users, 
                  color: "from-emerald-500 to-teal-600",
                  bg: "from-emerald-50 to-teal-50",
                  description: "Team projects and partnerships"
                },
                { 
                  title: "Community Feedback", 
                  items: mockUserData.arena?.feedback || [], 
                  icon: MessageCircle, 
                  color: "from-rose-500 to-pink-600",
                  bg: "from-rose-50 to-pink-50",
                  description: "Reviews and mentorship given"
                },
                { 
                  title: "Hackathon Wins", 
                  items: mockUserData.arena?.hackathons || [], 
                  icon: Trophy, 
                  color: "from-amber-500 to-orange-600",
                  bg: "from-amber-50 to-orange-50",
                  description: "Competition achievements"
                }
              ].map((section, index) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 rounded-xl border border-base-300 bg-base-100 group cursor-pointer h-full">
                    <CardContent className="p-6 h-full flex flex-col">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-10 h-10 ${
                          index % 4 === 0 ? 'bg-primary' : 
                          index % 4 === 1 ? 'bg-secondary' : 
                          index % 4 === 2 ? 'bg-accent' : 'bg-info'
                        } rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                          <section.icon className="w-5 h-5 text-primary-content" />
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-base-content">{section.title}</h2>
                          <p className="text-sm text-base-content/70">{section.description}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3 flex-1">
                        {section.items.map((item, itemIndex) => (
                          <motion.div
                            key={itemIndex}
                            className="flex items-center gap-3 p-4 rounded-lg bg-base-200 hover:bg-base-300 transition-all duration-300 group/item"
                            whileHover={{ scale: 1.02, x: 5 }}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: 0.2 + itemIndex * 0.1 }}
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <div className="w-3 h-3 bg-primary rounded-full group-hover/item:scale-125 transition-transform duration-300" />
                              <span className="text-base-content font-medium">{item}</span>
                            </div>
                            <div className="flex items-center gap-2 text-base-content/50">
                              <Heart className="w-4 h-4" />
                              <span className="text-sm">{Math.floor(Math.random() * 50) + 10}</span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
        {activeTab === 'forge' && (
          <motion.div 
            key="forge"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="w-full"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                // { 
                //   title: "Created Resources", 
                //   items: mockUserData.forge?.createdResources || [], 
                //   icon: Hammer, 
                //   color: "from-orange-500 to-red-600",
                //   bg: "from-orange-50 to-red-50",
                //   description: "Resources you've contributed"
                // },
                { 
                  title: "Bookmarked Resources", 
                  items: bookmarkedResources.map((resource: any) => resource.title || resource.name || 'Untitled Resource'), 
                  icon: Bookmark, 
                  color: "from-blue-500 to-indigo-600",
                  bg: "from-blue-50 to-indigo-50",
                  description: "Saved for later reference",
                  loading: forgeLoading,
                  error: forgeError
                },
                // { 
                //   title: "Community Reviews", 
                //   items: mockUserData.forge?.reviews || [], 
                //   icon: Star, 
                //   color: "from-emerald-500 to-teal-600",
                //   bg: "from-emerald-50 to-teal-50",
                //   description: "Reviews you've provided"
                // }
              ].map((section, index) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 rounded-xl border border-base-300 bg-base-100 group cursor-pointer h-full">
                    <CardContent className="p-6 h-full flex flex-col">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-10 h-10 ${
                          index % 3 === 0 ? 'bg-primary' : 
                          index % 3 === 1 ? 'bg-secondary' : 'bg-accent'
                        } rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                          <section.icon className="w-5 h-5 text-primary-content" />
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-base-content">{section.title}</h2>
                          <p className="text-sm text-base-content/70">{section.description}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3 flex-1">
                        {/* Loading State */}
                        {section.loading && (
                          <motion.div 
                            className="flex flex-col items-center justify-center py-8"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="relative">
                              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                              <div className="absolute inset-0 rounded-full border-2 border-primary/20"></div>
                            </div>
                            <span className="mt-3 text-sm text-base-content/70 font-medium">Loading {section.title.toLowerCase()}...</span>
                          </motion.div>
                        )}
                        
                        {/* Error State */}
                        {section.error && !section.loading && (
                          <motion.div 
                            className="flex flex-col items-center justify-center py-8 text-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="w-12 h-12 bg-error/10 rounded-full flex items-center justify-center mb-3">
                              <span className="text-error text-xl">⚠️</span>
                            </div>
                            <span className="text-sm font-medium text-error mb-1">Failed to load</span>
                            <span className="text-xs text-base-content/50">{section.error}</span>
                          </motion.div>
                        )}
                        
                        {/* Empty State */}
                        {!section.loading && !section.error && section.items.length === 0 && (
                          <motion.div 
                            className="flex flex-col items-center justify-center py-8 text-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="w-12 h-12 bg-base-300 rounded-full flex items-center justify-center mb-3">
                              <section.icon className="w-6 h-6 text-base-content/50" />
                            </div>
                            <span className="text-sm font-medium text-base-content/70 mb-1">No {section.title.toLowerCase()} yet</span>
                            <span className="text-xs text-base-content/50">Start bookmarking resources to see them here</span>
                          </motion.div>
                        )}
                        
                        {/* Items */}
                        {!section.loading && !section.error && section.items.map((item, itemIndex) => (
                          <motion.div
                            key={itemIndex}
                            className="flex items-center gap-3 p-4 rounded-lg bg-base-200 hover:bg-base-300 transition-all duration-300 group/item"
                            whileHover={{ scale: 1.02, x: 5 }}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: 0.2 + itemIndex * 0.1 }}
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <div className="w-3 h-3 bg-primary rounded-full group-hover/item:scale-125 transition-transform duration-300" />
                              <span className="text-base-content font-medium">{item}</span>
                            </div>
                            <div className="flex items-center gap-2 text-base-content/50">
                              <Eye className="w-4 h-4" />
                              <span className="text-sm">{Math.floor(Math.random() * 200) + 50}</span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
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
            className="w-full space-y-8 mb-10"
          >
            {/* Achievements Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 rounded-xl border border-base-300 bg-base-100">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-warning rounded-lg flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-warning-content" />
                    </div>
                    <h2 className="text-2xl font-semibold text-base-content">Achievements & Recognition</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Badges */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-base-content flex items-center gap-2">
                        <Award className="w-5 h-5 text-warning" />
                        Badges Earned
                      </h3>
                      <div className="space-y-3">
                        {(mockUserData.achievements?.badges || []).map((badge, index) => (
                          <motion.div
                            key={index}
                            className="flex items-center gap-3 p-3 rounded-lg bg-base-200 hover:bg-base-300 transition-all duration-300 cursor-pointer group"
                            whileHover={{ scale: 1.02, x: 5 }}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                          >
                            <div className="w-8 h-8 bg-warning rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <Star className="w-4 h-4 text-warning-content" />
                            </div>
                            <span className="text-base-content font-medium">{badge}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Testimonials */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-base-content flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-info" />
                        Testimonials
                      </h3>
                      <div className="space-y-3">
                        {mockUserData.testimonials.map((testimonial, index) => (
                          <motion.div
                            key={index}
                            className="p-4 rounded-lg bg-base-200 hover:bg-base-300 transition-all duration-300 cursor-pointer group"
                            whileHover={{ scale: 1.02 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                          >
                            <div className="flex items-center gap-3 mb-2">
                              <img 
                                src={testimonial.photo || 'https://via.placeholder.com/32'} 
                                alt={testimonial.name}
                                className="w-8 h-8 rounded-full border-2 border-base-100 shadow-sm"
                              />
                              <div>
                                <p className="font-semibold text-base-content text-sm">{testimonial.name}</p>
                                <p className="text-xs text-base-content/70">{testimonial.role}</p>
                              </div>
                            </div>
                            <p className="text-sm text-base-content/80 italic">"{testimonial.quote}"</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Certifications */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-base-content flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-success" />
                        Certifications
                      </h3>
                      <div className="space-y-3">
                        {mockUserData.certifications.map((cert, index) => (
                          <motion.div
                            key={index}
                            className="p-3 rounded-lg bg-base-200 hover:bg-base-300 transition-all duration-300 cursor-pointer group"
                            whileHover={{ scale: 1.02, x: 5 }}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold text-base-content text-sm">{cert.title}</p>
                                <p className="text-xs text-base-content/70">{cert.year}</p>
                              </div>
                              <ExternalLink className="w-4 h-4 text-base-content/50 group-hover:text-base-content transition-colors duration-300" />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Skills Progress Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 rounded-xl border border-base-300 bg-base-100">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-primary-content" />
                    </div>
                    <h2 className="text-2xl font-semibold text-base-content">Skills in Progress</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Active Skills */}
                    <div>
                      <h3 className="text-lg font-semibold text-base-content mb-4">Currently Learning</h3>
                      <div className="flex flex-wrap gap-3">
                        {(mockUserData.skillsInProgress?.activeTags || []).map((skill, index) => (
                          <motion.span
                            key={index}
                            className="px-3 py-1.5 bg-primary/10 text-primary-content rounded-lg text-sm font-medium border border-primary/20 hover:bg-primary/20 transition-all duration-300 cursor-pointer"
                            whileHover={{ scale: 1.05, y: -2 }}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                          >
                            {skill}
                          </motion.span>
                        ))}
                      </div>
                    </div>

                    {/* Progress Bars */}
                    <div>
                      <h3 className="text-lg font-semibold text-base-content mb-4">Skill Progress</h3>
                      <div className="space-y-4">
                        {(mockUserData.skillsInProgress?.progressBars || []).map((bar, index) => (
                          <motion.div
                            key={index}
                            className="space-y-2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-base-content">{bar.skill}</span>
                              <span className="text-sm font-semibold text-primary">{bar.percent}%</span>
                            </div>
                            <div className="w-full h-3 bg-base-300 rounded-full overflow-hidden">
                              <motion.div 
                                className="h-full bg-primary rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${bar.percent}%` }}
                                transition={{ duration: 1, delay: 0.5 + index * 0.2, ease: "easeOut" }}
                                style={{ width: `${bar.percent}%` }}
                              />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
        {activeTab === 'innovation' && (
          <motion.div 
            key="innovation"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="w-full space-y-8 mb-10"
          >
            {/* Innovation Journal */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 rounded-xl border border-base-300 bg-base-100">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                      <Brain className="w-5 h-5 text-accent-content" />
                    </div>
                    <h2 className="text-2xl font-semibold text-base-content">Innovation Journal</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Experiment Logs */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-base-content flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-warning" />
                        Experiment Logs
                      </h3>
                      <div className="space-y-3">
                        {(mockUserData.innovationJournal?.experimentLogs || []).map((log, index) => (
                          <motion.div
                            key={index}
                            className="p-4 rounded-lg bg-base-200 hover:bg-base-300 transition-all duration-300 cursor-pointer group"
                            whileHover={{ scale: 1.02, x: 5 }}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <Zap className="w-4 h-4 text-accent-content" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-base-content">{log}</p>
                                <p className="text-xs text-base-content/70 mt-1">
                                  {Math.floor(Math.random() * 30) + 1} days ago
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Reflections */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-base-content flex items-center gap-2">
                        <Coffee className="w-5 h-5 text-warning" />
                        Reflections
                      </h3>
                      <div className="space-y-3">
                        {(mockUserData.innovationJournal?.reflections || []).map((reflection, index) => (
                          <motion.div
                            key={index}
                            className="p-4 rounded-lg bg-base-200 hover:bg-base-300 transition-all duration-300 cursor-pointer group"
                            whileHover={{ scale: 1.02, x: 5 }}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <Brain className="w-4 h-4 text-secondary-content" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-base-content">{reflection}</p>
                                <p className="text-xs text-base-content/70 mt-1">
                                  {Math.floor(Math.random() * 14) + 1} days ago
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Open Challenges & Workspace */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Open Challenges */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 rounded-xl border border-base-300 bg-base-100 h-full">
                  <CardContent className="p-6 h-full flex flex-col">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-success rounded-lg flex items-center justify-center">
                        <Target className="w-5 h-5 text-success-content" />
                      </div>
                      <h2 className="text-xl font-semibold text-base-content">Open Challenges</h2>
                    </div>
                    
                    <div className="space-y-6 flex-1">
                      <div>
                        <h3 className="font-semibold text-base-content mb-3">Pinned Problems</h3>
                        <div className="space-y-2">
                          {(mockUserData.openChallenges?.pinnedProblems || []).map((problem, index) => (
                            <motion.div
                              key={index}
                              className="flex items-center gap-3 p-3 rounded-lg bg-base-200 hover:bg-base-300 transition-all duration-300 cursor-pointer group"
                              whileHover={{ scale: 1.02, x: 5 }}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                            >
                              <div className="w-2 h-2 bg-success rounded-full group-hover:scale-125 transition-transform duration-300" />
                              <span className="text-base-content font-medium">{problem}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-base-content mb-3">Dream Projects</h3>
                        <div className="space-y-2">
                          {(mockUserData.openChallenges?.dreamProjects || []).map((project, index) => (
                            <motion.div
                              key={index}
                              className="flex items-center gap-3 p-3 rounded-lg bg-base-200 hover:bg-base-300 transition-all duration-300 cursor-pointer group"
                              whileHover={{ scale: 1.02, x: 5 }}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                            >
                              <div className="w-2 h-2 bg-success rounded-full group-hover:scale-125 transition-transform duration-300" />
                              <span className="text-base-content font-medium">{project}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Workspace Habits */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Card className="overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 rounded-xl border border-base-300 bg-base-100 h-full">
                  <CardContent className="p-6 h-full flex flex-col">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-info rounded-lg flex items-center justify-center">
                        <Clock className="w-5 h-5 text-info-content" />
                      </div>
                      <h2 className="text-xl font-semibold text-base-content">Workspace Habits</h2>
                    </div>
                    
                    <div className="space-y-6 flex-1">
                      <div>
                        <h3 className="font-semibold text-base-content mb-3">Flow Patterns</h3>
                        <div className="space-y-2">
                          {(mockUserData.workspaceHabits?.flowPatterns || []).map((pattern, index) => (
                            <motion.div
                              key={index}
                              className="flex items-center gap-3 p-3 rounded-lg bg-base-200 hover:bg-base-300 transition-all duration-300 cursor-pointer group"
                              whileHover={{ scale: 1.02, x: 5 }}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                            >
                              <div className="w-2 h-2 bg-info rounded-full group-hover:scale-125 transition-transform duration-300" />
                              <span className="text-base-content font-medium">{pattern}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-base-content mb-3">Tool Stack</h3>
                        <div className="flex flex-wrap gap-2">
                          {(mockUserData.workspaceHabits?.toolStack || []).map((tool, index) => (
                            <motion.span
                              key={index}
                              className="px-3 py-1.5 bg-info/10 text-info-content rounded-lg text-sm font-medium border border-info/20 hover:bg-info/20 transition-all duration-300 cursor-pointer"
                              whileHover={{ scale: 1.05, y: -2 }}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                            >
                              {tool}
                            </motion.span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Background Selector Modal */}
      <BackgroundSelector
        currentBackground={currentBackground}
        onBackgroundChange={handleBackgroundChange}
        isOpen={isBackgroundSelectorOpen}
        onClose={() => setIsBackgroundSelectorOpen(false)}
      />
    </div>
  );
}