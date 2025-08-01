import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Search, X, ArrowRight, TrendingUp, Clock, Star, Code, Database, Globe, Zap, Target, Users, BookOpen, Lightbulb, Bug, MessageSquare, Plane, Briefcase } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getProblems, checkUserAnalysisForProblem } from '@/lib/crucibleApi';
import { useAuth } from '@clerk/clerk-react';
import { SpotlightCard } from '@/components/blocks/SpotlightCard';
import { GradientText } from '@/components/blocks/GradientText';
import Lottie from 'lottie-react';

// Create a simple toast implementation since we don't have the UI component
const useToast = () => {
  const toast = ({ title, description }: { title: string; description: string; variant?: string }) => {
    console.log(`${title}: ${description}`);
  };
  
  return { toast };
};

// Problem categories with icons and colors
const problemCategories = [
  {
    id: 'algorithms',
    name: 'Algorithms',
    description: 'Data structures, sorting, searching, and algorithmic thinking',
    icon: Code,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    count: 0
  },
  {
    id: 'system-design',
    name: 'System Design',
    description: 'Scalable architectures, distributed systems, and design patterns',
    icon: Database,
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
    count: 0
  },
  {
    id: 'web-development',
    name: 'Web Development',
    description: 'Frontend, backend, APIs, and modern web technologies',
    icon: Globe,
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
    count: 0
  },
  {
    id: 'mobile-development',
    name: 'Mobile Development',
    description: 'iOS, Android, React Native, and mobile app challenges',
    icon: Zap,
    color: 'from-yellow-500 to-orange-500',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/20',
    count: 0
  },
  {
    id: 'data-science',
    name: 'Data Science',
    description: 'Machine learning, data analysis, and statistical modeling',
    icon: Target,
    color: 'from-red-500 to-pink-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
    count: 0
  },
  {
    id: 'devops',
    name: 'DevOps',
    description: 'CI/CD, cloud infrastructure, and deployment strategies',
    icon: Users,
    color: 'from-indigo-500 to-blue-500',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/20',
    count: 0
  },
  {
    id: 'frontend',
    name: 'Frontend',
    description: 'React, Vue, Angular, and modern UI/UX challenges',
    icon: BookOpen,
    color: 'from-teal-500 to-cyan-500',
    bgColor: 'bg-teal-500/10',
    borderColor: 'border-teal-500/20',
    count: 0
  },
  {
    id: 'backend',
    name: 'Backend',
    description: 'Node.js, Python, Java, and server-side development',
    icon: Lightbulb,
    color: 'from-amber-500 to-yellow-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    count: 0
  }
];

// Hot/Latest problems interface
interface HotProblem {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  category: string;
  solvedCount: number;
  trending: boolean;
}

export default function CruciblePage() {
  const navigate = useNavigate();
  const { username } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [problems, setProblems] = useState<any[]>([]);
  const [hotProblems, setHotProblems] = useState<HotProblem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [catAnimation, setCatAnimation] = useState<any>(null);
  const [stressAnimation, setStressAnimation] = useState<any>(null);
  const [checkingAnalysis, setCheckingAnalysis] = useState<string | null>(null);
  const { toast } = useToast();
  const { isLoaded: authLoaded, isSignedIn, getToken } = useAuth();
  
  // Real hot problems data with actual problem IDs
  const mockHotProblems: HotProblem[] = [
    {
      id: '507f1f77bcf86cd799439011', // Design a URL Shortener
      title: 'Design a URL Shortener',
      difficulty: 'medium',
      category: 'system-design',
      solvedCount: 156,
      trending: true
    },
    {
      id: '507f1f77bcf86cd799439012', // Implement LRU Cache
      title: 'Implement LRU Cache',
      difficulty: 'hard',
      category: 'algorithms',
      solvedCount: 89,
      trending: true
    },
    {
      id: '507f1f77bcf86cd799439013', // Build a Real-time Chat App
      title: 'Build a Real-time Chat App',
      difficulty: 'medium',
      category: 'web-development',
      solvedCount: 234,
      trending: false
    },
    {
      id: '507f1f77bcf86cd799439014', // Design a Rate Limiter
      title: 'Design a Rate Limiter',
      difficulty: 'hard',
      category: 'system-design',
      solvedCount: 67,
      trending: true
    }
  ];
  
  // Fetch problems from API
  const fetchProblems = async () => {
    if (!isSignedIn) {
      setError('Please sign in to view problems');
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      const problemsData = await getProblems({ limit: 100 });
      
      if (problemsData && Array.isArray(problemsData)) {
        setProblems(problemsData);
        
        // Update category counts
        const categoryCounts = problemsData.reduce((acc: any, problem: any) => {
          problem.tags.forEach((tag: string) => {
            const category = problemCategories.find(cat => cat.id === tag);
            if (category) {
              acc[category.id] = (acc[category.id] || 0) + 1;
            }
          });
          return acc;
        }, {});
        
        // Update categories with counts
        problemCategories.forEach(category => {
          category.count = categoryCounts[category.id] || 0;
        });
      }
    } catch (err) {
      console.error('Error fetching problems:', err);
      setError('Failed to load problems');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load animations
  useEffect(() => {
    const loadAnimations = async () => {
      try {
        const [catResponse, stressResponse] = await Promise.all([
          fetch('/Cat Movement.json'),
          fetch('/Stress Management.json')
        ]);
        
        const catData = await catResponse.json();
        const stressData = await stressResponse.json();
        
        setCatAnimation(catData);
        setStressAnimation(stressData);
      } catch (error) {
        console.error('Error loading animations:', error);
      }
    };
    
    loadAnimations();
  }, []);

  // Load hot problems
  useEffect(() => {
    setHotProblems(mockHotProblems);
  }, []);
  
  // Initial load
  useEffect(() => {
    if (authLoaded && isSignedIn) {
      fetchProblems();
    }
  }, [authLoaded, isSignedIn]);
  
  // Handle category selection
  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    navigate(`/${username}/crucible/category/${categoryId}`);
  };

  // Handle hot problem click with analysis check
  const handleHotProblemClick = async (problemId: string) => {
    // Set loading state for this problem
    setCheckingAnalysis(problemId);
    
    try {
      // Check if user is reattempting this problem
      const isReattempting = sessionStorage.getItem(`reattempting_${problemId}`);
      const reattemptTime = sessionStorage.getItem(`reattempt_time_${problemId}`);
      const isActivelyReattempting = reattemptTime && (Date.now() - parseInt(reattemptTime)) < 30 * 60 * 1000;
      
      if (isReattempting || isActivelyReattempting) {
        // If user is reattempting, go directly to problem page instead of result page
        navigate(`/${username}/crucible/problem/${problemId}`);
        return;
      }
      
      // Check if user has analysis for this problem
      const analysisId = await checkUserAnalysisForProblem(problemId, getToken);
      
      if (analysisId) {
        // If analysis exists, redirect directly to result page
        navigate(`/${username}/crucible/results/${analysisId}`);
      } else {
        // If no analysis, navigate to problem page as usual
        navigate(`/${username}/crucible/problem/${problemId}`);
      }
    } catch (error) {
      // If there's an error checking analysis, fall back to normal navigation
      console.warn('Error checking analysis, falling back to problem page:', error);
      navigate(`/${username}/crucible/problem/${problemId}`);
    } finally {
      // Clear loading state
      setCheckingAnalysis(null);
    }
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'hard': return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
      case 'expert': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-50 to-base-100">
            {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="mb-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-base-100/80 backdrop-blur-sm border border-base-300 rounded-full text-xs text-base-content/70 mb-2">
                <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse"></span>
                Join 10,000+ developers mastering their skills
              </div>
            </div>
            
            <GradientText text="Master Your Skills" className="text-4xl md:text-5xl font-bold mb-3" />
            <p className="text-lg md:text-xl text-base-content/80 mb-6 max-w-2xl mx-auto leading-relaxed">
              Solve real-world programming challenges, design scalable systems, and build your portfolio with our curated collection of problems.
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto mb-6">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-primary/80 rounded-xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
                <input
                  type="text"
                  className="relative w-full pl-10 pr-10 py-3 text-base bg-base-100/90 backdrop-blur-md border border-base-300 rounded-xl shadow-lg focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-300 text-base-content placeholder:text-base-content/60"
                  placeholder="Search for challenges..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/60" />
                {searchQuery && (
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-base-content/60 hover:text-error hover:bg-error/10 transition-colors"
                    onClick={() => setSearchQuery('')}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex justify-center gap-6 mb-6">
              <div className="text-center group">
                <div className="text-2xl font-bold text-primary mb-1 group-hover:scale-110 transition-transform">500+</div>
                <div className="text-sm text-base-content/70">Challenges</div>
              </div>
              <div className="text-center group">
                <div className="text-2xl font-bold text-primary mb-1 group-hover:scale-110 transition-transform">10k+</div>
                <div className="text-sm text-base-content/70">Solutions</div>
              </div>
              <div className="text-center group">
                <div className="text-2xl font-bold text-primary mb-1 group-hover:scale-110 transition-transform">95%</div>
                <div className="text-sm text-base-content/70">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Cat Movement Animation at bottom right */}
        {catAnimation && (
          <div className="absolute bottom-0 right-8 w-80 h-40 opacity-80">
            <Lottie 
              animationData={catAnimation} 
              loop={true}
              autoplay={true}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        )}

        {/* Stress Management Animation at center left */}
        {stressAnimation && (
          <div className="absolute left-5 bottom-0 transform  w-100 h-85 opacity-80">
            <Lottie 
              animationData={stressAnimation} 
              loop={true}
              autoplay={true}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        )}
      </div>

      {/* Categories Section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-base-content mb-4">Choose Your Challenge</h2>
          <p className="text-base-content/60 text-lg">Explore problems by category and find your next challenge</p>
        </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {problemCategories.map((category) => (
             <div key={category.id} onClick={() => handleCategoryClick(category.id)}>
               <SpotlightCard className="group cursor-pointer">
                 <div className={`p-6 rounded-xl border-2 transition-all duration-300 ${category.bgColor} ${category.borderColor} hover:border-opacity-40 group-hover:scale-105`}>
                   <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                     <category.icon className="w-6 h-6 text-white" />
                   </div>
                   <h3 className="text-lg font-semibold text-base-content mb-2">{category.name}</h3>
                   <p className="text-sm text-base-content/70 mb-4 line-clamp-2">{category.description}</p>
                   <div className="flex items-center justify-between">
                     <Badge variant="secondary" className="text-xs">
                       {category.count} problems
                     </Badge>
                     <ArrowRight className="w-4 h-4 text-base-content/40 group-hover:text-primary transition-colors" />
                   </div>
                 </div>
               </SpotlightCard>
             </div>
           ))}
          </div>
      </div>

      {/* Hot & Latest Problems */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-base-content mb-2">Trending Challenges</h2>
            <p className="text-base-content/60">Most popular and recently solved problems</p>
          </div>
          <button className="text-primary hover:text-primary/80 font-medium flex items-center gap-2">
            View all <ArrowRight className="w-4 h-4" />
          </button>
        </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {hotProblems.map((problem) => (
             <div key={problem.id} onClick={() => handleHotProblemClick(problem.id)}>
               <SpotlightCard className="cursor-pointer">
                 <div className={cn(
                   "p-6 rounded-xl border border-base-300 hover:border-primary/30 transition-all duration-300 group relative",
                   checkingAnalysis === problem.id && "opacity-75"
                 )}>
                   {checkingAnalysis === problem.id && (
                     <div className="absolute inset-0 bg-base-100/80 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
                       <div className="flex items-center gap-2 text-primary">
                         <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                         <span className="text-sm">Checking...</span>
                       </div>
                     </div>
                   )}
                   <div className="flex items-start justify-between mb-3">
                     <Badge className={cn("text-xs", getDifficultyColor(problem.difficulty))}>
                       {problem.difficulty}
                     </Badge>
                     {problem.trending && (
                       <TrendingUp className="w-4 h-4 text-orange-500" />
                     )}
                   </div>
                   <h3 className="font-semibold text-base-content mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                     {problem.title}
                   </h3>
                   <div className="flex items-center justify-between text-sm text-base-content/60">
                     <div className="flex items-center gap-1">
                       <Users className="w-4 h-4" />
                       {problem.solvedCount} solved
                     </div>
                     <div className="flex items-center gap-1">
                       <Clock className="w-4 h-4" />
                       Latest
                     </div>
                   </div>
                 </div>
               </SpotlightCard>
             </div>
           ))}
         </div>
      </div>


    </div>
  );
} 