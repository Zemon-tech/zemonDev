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

  // Initialize GSAP animations
  useGSAP(() => {
    if (!avatarRef.current || !taglineRef.current || !heroRef.current || !statsRef.current) return;

    // Hero section animations
    gsap.fromTo(avatarRef.current,
      { scale: 0.8, opacity: 0 },
      { scale: 1, opacity: 1, duration: 1, ease: "power3.out" }
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
        className="relative w-full h-[280px] bg-gradient-to-r from-indigo-900/20 to-blue-900/20 overflow-hidden"
      >
        {/* Background Image */}
        <div className="absolute inset-0 bg-[url('/city-sunset.jpg')] bg-cover bg-center opacity-20" />
        
        {/* Content */}
        <div className="container mx-auto px-4">
          <div className="relative pt-32">
            <div ref={avatarRef} className="absolute -bottom-16 left-8">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                <img
                  src={user?.imageUrl || 'https://via.placeholder.com/200'}
                  alt="Profile"
                  className="w-32 h-32 rounded-full border-4 border-base-100 shadow-xl relative z-10"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Profile Content */}
      <main className="container mx-auto px-4">
        {/* Profile Header */}
        <div className="mt-20 mb-8">
          <h1 
            ref={nameRef}
            className="text-3xl font-bold mb-2"
          >
            {mockUserData.name}
          </h1>
          <div 
            ref={taglineRef}
            className="text-lg text-base-content/80 mb-4"
          >
            {mockUserData.title.split(' ').map((word, i) => (
              <span key={i} className="inline-block mx-1">{word}</span>
            ))}
          </div>
          <div className="flex gap-3">
            <Button 
              size="sm"
              className="gap-2"
            >
              <Download size={16} />
              Download Résumé
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="gap-2"
            >
              <ExternalLink size={16} />
              View on Zemon
            </Button>
          </div>
        </div>

        {/* Quick Stats Strip */}
        <div ref={statsRef} className="grid grid-cols-4 gap-4 mb-8">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-base-200/50 hover:bg-base-200 transition-colors">
            <Flame size={20} className="text-primary" />
            <div>
              <div className="font-semibold">{mockUserData.stats.zemonStreak}</div>
              <div className="text-xs text-base-content/60">Days Streak</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-base-200/50 hover:bg-base-200 transition-colors">
            <Github size={20} className="text-primary" />
            <div>
              <div className="font-semibold">{mockUserData.stats.githubStreak}</div>
              <div className="text-xs text-base-content/60">GitHub</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-base-200/50 hover:bg-base-200 transition-colors">
            <Code size={20} className="text-primary" />
            <div>
              <div className="font-semibold">{mockUserData.stats.crucibleSolutions}</div>
              <div className="text-xs text-base-content/60">Solutions</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-base-200/50 hover:bg-base-200 transition-colors">
            <Hammer size={20} className="text-primary" />
            <div>
              <div className="font-semibold">{mockUserData.stats.forgeContributions}</div>
              <div className="text-xs text-base-content/60">Forge</div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="col-span-2 space-y-6">
            {/* About */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">About</h2>
                <p className="text-base-content/80">{mockUserData.bio}</p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {mockUserData.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 rounded-full bg-primary/10 text-primary text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Projects */}
            <section ref={projectsRef}>
              <h2 className="text-xl font-semibold mb-4">Featured Projects</h2>
              <div className={`grid grid-cols-2 gap-4 transition-all duration-1000 ${projectsInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                {mockUserData.projects.map((project, index) => (
                  <Card key={index} className="group overflow-hidden">
                    <CardContent className="p-0">
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-40 object-cover"
                      />
                      <div className="p-4">
                        <h3 className="text-lg font-semibold mb-2">{project.title}</h3>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {project.tech.map((tech, techIndex) => (
                            <span
                              key={techIndex}
                              className="px-2 py-0.5 bg-base-200 rounded text-xs"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                        <p className="text-sm text-base-content/70">{project.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Testimonials */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Testimonials</h2>
              <div className="grid grid-cols-2 gap-4">
                {mockUserData.testimonials.map((testimonial, index) => (
                  <Card key={index} className="bg-base-200/50">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <img
                          src={testimonial.photo}
                          alt={testimonial.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <p className="text-sm italic mb-2">"{testimonial.quote}"</p>
                          <p className="text-sm font-medium">{testimonial.name}</p>
                          <p className="text-xs text-base-content/70">{testimonial.role}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Contact Info */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <School size={16} className="text-primary" />
                  <span className="text-sm">{mockUserData.education}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-primary" />
                  <span className="text-sm">{mockUserData.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-primary" />
                  <span className="text-sm">{mockUserData.email}</span>
                </div>
                <div className="flex gap-3 mt-4">
                  <a href="#" className="text-base-content/70 hover:text-primary transition-colors">
                    <Linkedin size={18} />
                  </a>
                  <a href="#" className="text-base-content/70 hover:text-primary transition-colors">
                    <Github size={18} />
                  </a>
                  <a href="#" className="text-base-content/70 hover:text-primary transition-colors">
                    <Twitter size={18} />
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Education & Certifications */}
            <Card>
              <CardContent className="p-4">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <GraduationCap size={18} className="text-primary" />
                  Education & Certifications
                </h2>
                <div className="space-y-4">
                  {mockUserData.certifications.map((cert, index) => (
                    <div key={index} className="group relative pl-4 border-l-2 border-primary/20 hover:border-primary transition-colors">
                      <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-primary/20 group-hover:bg-primary transition-colors" />
                      <div className="text-xs text-base-content/60">{cert.year}</div>
                      <a
                        href={cert.link}
                        className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1"
                      >
                        <Award size={14} />
                        {cert.title}
                      </a>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Connect */}
            <Card>
              <CardContent className="p-4">
                <h2 className="text-lg font-semibold mb-3">Quick Connect</h2>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Mail size={16} />
                    Send Email
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Coffee size={16} />
                    Schedule Meeting
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-base-300 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-base-content/70">
          <p>© 2024 {mockUserData.name} • Built with Zemon</p>
          <div className="mt-2">
            <a href="#" className="hover:text-primary">Privacy</a>
            <span className="mx-2">·</span>
            <a href="#" className="hover:text-primary">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
} 