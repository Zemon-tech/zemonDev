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
  ]
};

export default function ProfilePage() {
  const { user } = useUser();
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

  return (
    <div className="min-h-screen bg-base-100">
      {/* LinkedIn-style Hero Section */}
      <section 
        ref={heroRef}
        className="relative w-full h-[140px] bg-gradient-to-r from-slate-200 to-slate-100 overflow-hidden"
      >
        {/* Background Image with subtle gradient overlay */}
        <div className="absolute inset-0 bg-[url('/city-sunset.jpg')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-100/30" />
        
        {/* Content Container */}
        <div className="container mx-auto px-4 relative h-full">
          {/* Action Buttons - Positioned at bottom right */}
          <div 
            ref={buttonsRef}
            className="absolute bottom-4 right-4 flex gap-3 z-10"
          >
            <Button 
              size="sm"
              variant="outline"
              className="bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-300 text-slate-800 border border-slate-200 shadow-sm hover:shadow-md gap-2"
            >
              <Download size={16} />
              Download Résumé
            </Button>
            <Button 
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 transition-all duration-300 text-white shadow-sm hover:shadow-md gap-2"
            >
              <ExternalLink size={16} />
              View on Zemon
            </Button>
          </div>
        </div>
      </section>

      {/* Avatar - Perfectly centered vertically on the hero section border */}
      <div className="container mx-auto px-4">
        <div className="relative -mt-[70px] ml-6">
          <div 
            ref={avatarRef} 
            className="relative inline-block"
          >
            <div className="absolute inset-0 rounded-full shadow-lg blur-[2px] bg-slate-500/10"></div>
            <img
              src={user?.imageUrl || 'https://via.placeholder.com/200'}
              alt="Profile"
              className="w-[140px] h-[140px] rounded-full border-4 border-white shadow-md relative z-10 transition-transform duration-300 hover:scale-[1.02]"
            />
          </div>
            </div>
          </div>

      {/* Profile Content */}
      <main className="container mx-auto px-4">
        {/* Profile Header - Reduced spacing */}
        <div className="mt-6 mb-6 ml-6">
          <h1 
            ref={nameRef}
            className="text-3xl font-bold mb-1 text-slate-800"
          >
            {mockUserData.name}
          </h1>
          <div 
            ref={taglineRef}
            className="text-lg text-slate-600 mb-4"
          >
            {mockUserData.title.split(' ').map((word, i) => (
              <span key={i} className="inline-block mx-1">{word}</span>
            ))}
          </div>
        </div>

        {/* Rest of the content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Main content - 2/3 width on desktop */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 mb-6">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4 text-slate-800">About</h2>
                <p className="text-slate-600 mb-6">{mockUserData.bio}</p>
                
                <div className="flex flex-wrap gap-2 mt-4">
                  {mockUserData.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm"
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
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
            >
              <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 bg-gradient-to-br from-indigo-50 to-white">
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <Flame className="w-8 h-8 text-indigo-500 mb-2" />
                  <span className="text-2xl font-bold text-slate-800">{mockUserData.stats.zemonStreak}</span>
                  <span className="text-sm text-slate-600">Zemon Streak</span>
                </CardContent>
              </Card>
              
              <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 bg-gradient-to-br from-emerald-50 to-white">
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <Code className="w-8 h-8 text-emerald-500 mb-2" />
                  <span className="text-2xl font-bold text-slate-800">{mockUserData.stats.githubStreak}</span>
                  <span className="text-sm text-slate-600">GitHub Streak</span>
                </CardContent>
              </Card>
              
              <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 bg-gradient-to-br from-amber-50 to-white">
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <BookOpen className="w-8 h-8 text-amber-500 mb-2" />
                  <span className="text-2xl font-bold text-slate-800">{mockUserData.stats.crucibleSolutions}</span>
                  <span className="text-sm text-slate-600">Crucible Solutions</span>
                    </CardContent>
                  </Card>
              
              <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 bg-gradient-to-br from-rose-50 to-white">
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <Hammer className="w-8 h-8 text-rose-500 mb-2" />
                  <span className="text-2xl font-bold text-slate-800">{mockUserData.stats.forgeContributions}</span>
                  <span className="text-sm text-slate-600">Forge Contributions</span>
                    </CardContent>
                  </Card>
              </div>
          </div>

          {/* Sidebar - 1/3 width on desktop */}
          <div>
            <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 mb-6">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <School className="text-slate-600" />
                  <div>
                    <p className="font-medium text-slate-800">B.Tech in Computer Science</p>
                    <p className="text-sm text-slate-600">MAIT, Delhi</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="text-slate-600" />
                  <span className="text-slate-700">{mockUserData.location}</span>
                </div>
                
                <div className="flex items-center gap-3 mb-4">
                  <Mail className="text-slate-600" />
                  <span className="text-slate-700">{mockUserData.email}</span>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <a href="#" className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors duration-300">
                    <Github className="w-5 h-5 text-slate-700" />
                  </a>
                  <a href="#" className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors duration-300">
                    <Linkedin className="w-5 h-5 text-slate-700" />
                  </a>
                  <a href="#" className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors duration-300">
                    <Twitter className="w-5 h-5 text-slate-700" />
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
} 