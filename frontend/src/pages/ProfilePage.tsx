import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useInView } from 'react-intersection-observer';
import { 
  Github, 
  Linkedin, 
  Twitter, 
  Download, 
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
  Award
} from 'lucide-react';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Mock data - replace with real data from your backend
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
  const [activeTab, setActiveTab] = useState('overview');
  const [activeSection, setActiveSection] = useState<string>('system-design');
  
  // Refs for GSAP animations
  const heroRef = useRef<HTMLElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);

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

  // Intersection observer for scroll-based animations
  const [projectsRef, projectsInView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  // Tab definitions
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'crucible', label: 'Crucible' },
    { id: 'arena', label: 'Arena' },
    { id: 'forge', label: 'Forge' },
    { id: 'achievements', label: 'Achievements & Skills' },
    { id: 'innovation', label: 'Innovation & Workspace' },
  ];

  return (
    <div className="min-h-screen bg-base-100">
      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="relative w-full h-[140px] bg-gradient-to-r from-slate-100 to-slate-50 overflow-hidden border-b border-slate-200"
      >
        <div className="absolute inset-0 bg-[url('/city-sunset.jpg')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-100/40" />
        <div className="container mx-auto px-4 relative h-full flex items-end justify-end">
          <div ref={buttonsRef} className="flex gap-3 mb-4">
            <Button 
              size="sm"
              variant="outline"
              className="bg-white/90 backdrop-blur-md hover:bg-slate-50 transition-all duration-300 text-slate-800 border border-slate-200 shadow hover:shadow-lg gap-2 font-semibold px-4 py-2 rounded-lg"
            >
              <Download size={16} />
              Download Résumé
            </Button>
            <Button 
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 transition-all duration-300 text-white shadow hover:shadow-lg gap-2 font-semibold px-4 py-2 rounded-lg"
            >
              <ExternalLink size={16} />
              View on Zemon
            </Button>
          </div>
        </div>
      </section>
      <div className="container mx-auto px-4">
        <div className="relative -mt-[70px] ml-6 flex items-end gap-6">
          <div 
            ref={avatarRef} 
            className="relative inline-block"
          >
            <div className="absolute inset-0 rounded-full shadow-xl blur-[2px] bg-slate-500/10"></div>
            <img
              src={user?.imageUrl || 'https://via.placeholder.com/200'}
              alt="Profile"
              className="w-[120px] h-[120px] rounded-full border-4 border-white shadow-lg relative z-10 transition-transform duration-300 hover:scale-[1.04]"
            />
          </div>
          <div className="mb-4">
            <h1 ref={nameRef} className="text-3xl font-extrabold text-slate-900 leading-tight mb-1 tracking-tight">
              {mockUserData.name}
            </h1>
            <div ref={taglineRef} className="text-base font-medium text-slate-600 flex flex-wrap gap-1">
              {mockUserData.title.split(' ').map((word, i) => (
                <span key={i} className="inline-block px-1 py-0.5 rounded text-indigo-600 bg-indigo-50 font-semibold">
                  {word}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="container mx-auto px-4 mt-8">
        <div className="flex flex-wrap gap-2 border-b border-slate-200">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`px-4 py-2 text-sm font-semibold rounded-t transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400
                ${activeTab === tab.id ? 'bg-white border-x border-t border-slate-200 text-indigo-700 shadow-sm -mb-px' : 'bg-slate-100 text-slate-500 hover:bg-white'}`}
              onClick={() => setActiveTab(tab.id)}
              aria-selected={activeTab === tab.id}
              role="tab"
              tabIndex={activeTab === tab.id ? 0 : -1}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="container mx-auto px-4 mt-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10 mt-0">
            {/* Main content - 2/3 width on desktop */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* About Card */}
              <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl border border-slate-100 bg-white/95">
                <CardContent className="p-7">
                  <h2 className="text-xl font-bold mb-3 text-slate-900">About</h2>
                  <p className="text-slate-700 mb-6 text-base leading-relaxed">{mockUserData.bio}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {mockUserData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium shadow-sm hover:bg-indigo-100 transition-colors duration-200 cursor-pointer"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
              {/* Stats Section */}
              <div 
                ref={statsRef}
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
              >
                <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-indigo-50 to-white rounded-xl border border-slate-100">
                  <CardContent className="p-5 flex flex-col items-center justify-center">
                    <Flame className="w-8 h-8 text-indigo-500 mb-2" />
                    <span className="text-2xl font-bold text-slate-900">{mockUserData.stats.zemonStreak}</span>
                    <span className="text-xs text-slate-600 font-medium">Zemon Streak</span>
                  </CardContent>
                </Card>
                <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-emerald-50 to-white rounded-xl border border-slate-100">
                  <CardContent className="p-5 flex flex-col items-center justify-center">
                    <Code className="w-8 h-8 text-emerald-500 mb-2" />
                    <span className="text-2xl font-bold text-slate-900">{mockUserData.stats.githubStreak}</span>
                    <span className="text-xs text-slate-600 font-medium">GitHub Streak</span>
                  </CardContent>
                </Card>
                <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-amber-50 to-white rounded-xl border border-slate-100">
                  <CardContent className="p-5 flex flex-col items-center justify-center">
                    <BookOpen className="w-8 h-8 text-amber-500 mb-2" />
                    <span className="text-2xl font-bold text-slate-900">{mockUserData.stats.crucibleSolutions}</span>
                    <span className="text-xs text-slate-600 font-medium">Crucible Solutions</span>
                  </CardContent>
                </Card>
                <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-rose-50 to-white rounded-xl border border-slate-100">
                  <CardContent className="p-5 flex flex-col items-center justify-center">
                    <Hammer className="w-8 h-8 text-rose-500 mb-2" />
                    <span className="text-2xl font-bold text-slate-900">{mockUserData.stats.forgeContributions}</span>
                    <span className="text-xs text-slate-600 font-medium">Forge Contributions</span>
                  </CardContent>
                </Card>
              </div>
            </div>
            {/* Sidebar - 1/3 width on desktop */}
            <div className="flex flex-col gap-6">
              <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 mb-0 rounded-2xl border border-slate-100 bg-white/95">
                <CardContent className="p-7">
                  <div className="flex items-center gap-3 mb-4">
                    <School className="text-slate-600" />
                    <div>
                      <p className="font-semibold text-slate-900">B.Tech in Computer Science</p>
                      <p className="text-sm text-slate-600">MAIT, Delhi</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <MapPin className="text-slate-600" />
                    <span className="text-slate-800 text-sm">{mockUserData.location}</span>
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <Mail className="text-slate-600" />
                    <span className="text-slate-800 text-sm">{mockUserData.email}</span>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <a href="#" className="p-2 rounded-full bg-slate-100 hover:bg-indigo-50 transition-colors duration-300 shadow-sm">
                      <Github className="w-5 h-5 text-slate-700" />
                    </a>
                    <a href="#" className="p-2 rounded-full bg-slate-100 hover:bg-indigo-50 transition-colors duration-300 shadow-sm">
                      <Linkedin className="w-5 h-5 text-slate-700" />
                    </a>
                    <a href="#" className="p-2 rounded-full bg-slate-100 hover:bg-indigo-50 transition-colors duration-300 shadow-sm">
                      <Twitter className="w-5 h-5 text-slate-700" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
        {activeTab === 'crucible' && (
          <div className="max-w-3xl mx-auto">
            <Card className="overflow-hidden shadow-lg rounded-2xl border border-slate-100 bg-white/95 mb-6">
              <CardContent className="p-7">
                <h2 className="text-lg font-bold mb-3 text-indigo-700">Crucible</h2>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div>
                    <span className="font-semibold">Solution Journeys:</span> {(mockUserData.crucible?.solutionJourneys || []).join(", ")}
                  </div>
                  <div>
                    <span className="font-semibold">Drafts:</span> {(mockUserData.crucible?.drafts || []).join(", ")}
                  </div>
                  <div>
                    <span className="font-semibold">Notes:</span> {(mockUserData.crucible?.notes || []).join(", ")}
                  </div>
                  <div>
                    <span className="font-semibold">Diagrams:</span> {(mockUserData.crucible?.diagrams || []).join(", ")}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        {activeTab === 'arena' && (
          <div className="max-w-3xl mx-auto">
            <Card className="overflow-hidden shadow-lg rounded-2xl border border-slate-100 bg-white/95 mb-6">
              <CardContent className="p-7">
                <h2 className="text-lg font-bold mb-3 text-indigo-700">Arena</h2>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div><span className="font-semibold">Projects:</span> {(mockUserData.arena?.projects || []).join(", ")}</div>
                  <div><span className="font-semibold">Collaboration:</span> {(mockUserData.arena?.collaboration || []).join(", ")}</div>
                  <div><span className="font-semibold">Feedback:</span> {(mockUserData.arena?.feedback || []).join(", ")}</div>
                  <div><span className="font-semibold">Hackathons:</span> {(mockUserData.arena?.hackathons || []).join(", ")}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        {activeTab === 'forge' && (
          <div className="max-w-3xl mx-auto">
            <Card className="overflow-hidden shadow-lg rounded-2xl border border-slate-100 bg-white/95 mb-6">
              <CardContent className="p-7">
                <h2 className="text-lg font-bold mb-3 text-indigo-700">Forge</h2>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div><span className="font-semibold">Created Resources:</span> {(mockUserData.forge?.createdResources || []).join(", ")}</div>
                  <div><span className="font-semibold">Bookmarked Resources:</span> {(mockUserData.forge?.bookmarkedResources || []).join(", ")}</div>
                  <div><span className="font-semibold">Reviews:</span> {(mockUserData.forge?.reviews || []).join(", ")}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        {activeTab === 'achievements' && (
          <div className="max-w-3xl mx-auto flex flex-col gap-6">
            <Card className="overflow-hidden shadow-lg rounded-2xl border border-slate-100 bg-white/95">
              <CardContent className="p-7">
                <h2 className="text-lg font-bold mb-3 text-indigo-700">Achievements</h2>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div><span className="font-semibold">Badges:</span> {(mockUserData.achievements?.badges || []).join(", ")}</div>
                  <div><span className="font-semibold">Testimonials:</span> {(mockUserData.achievements?.testimonials || []).join(", ")}</div>
                  <div><span className="font-semibold">Certs:</span> {(mockUserData.achievements?.certs || []).join(", ")}</div>
                </div>
              </CardContent>
            </Card>
            <Card className="overflow-hidden shadow-lg rounded-2xl border border-slate-100 bg-white/95">
              <CardContent className="p-7">
                <h2 className="text-lg font-bold mb-3 text-indigo-700">Skills-in-Progress</h2>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div><span className="font-semibold">Active Tags:</span> {(mockUserData.skillsInProgress?.activeTags || []).join(", ")}</div>
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold">Progress Bars:</span>
                    {(mockUserData.skillsInProgress?.progressBars || []).map((bar, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span>{bar.skill}:</span>
                        <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-2 bg-indigo-400 rounded-full" style={{ width: `${bar.percent}%` }}></div>
                        </div>
                        <span>{bar.percent}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        {activeTab === 'innovation' && (
          <div className="max-w-3xl mx-auto flex flex-col gap-6">
            <Card className="overflow-hidden shadow-lg rounded-2xl border border-slate-100 bg-white/95">
              <CardContent className="p-7">
                <h2 className="text-lg font-bold mb-3 text-indigo-700">Innovation Journal</h2>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div><span className="font-semibold">Experiment Logs:</span> {(mockUserData.innovationJournal?.experimentLogs || []).join(", ")}</div>
                  <div><span className="font-semibold">Reflections:</span> {(mockUserData.innovationJournal?.reflections || []).join(", ")}</div>
                </div>
              </CardContent>
            </Card>
            <Card className="overflow-hidden shadow-lg rounded-2xl border border-slate-100 bg-white/95">
              <CardContent className="p-7">
                <h2 className="text-lg font-bold mb-3 text-indigo-700">Open Challenges</h2>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div><span className="font-semibold">Pinned Problems:</span> {(mockUserData.openChallenges?.pinnedProblems || []).join(", ")}</div>
                  <div><span className="font-semibold">Dream Projects:</span> {(mockUserData.openChallenges?.dreamProjects || []).join(", ")}</div>
                </div>
              </CardContent>
            </Card>
            <Card className="overflow-hidden shadow-lg rounded-2xl border border-slate-100 bg-white/95">
              <CardContent className="p-7">
                <h2 className="text-lg font-bold mb-3 text-indigo-700">Workspace Habits</h2>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div><span className="font-semibold">Flow Patterns:</span> {(mockUserData.workspaceHabits?.flowPatterns || []).join(", ")}</div>
                  <div><span className="font-semibold">Tool Stack:</span> {(mockUserData.workspaceHabits?.toolStack || []).join(", ")}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}