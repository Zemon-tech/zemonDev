import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowRight, TrendingUp, Clock, Code, Database, Globe, Zap, Target, Users, BookOpen, Lightbulb } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getProblems, checkUserAnalysisForProblem, getTrendingProblems, ITrendingProblem } from '@/lib/crucibleApi';
import { useAuth } from '@clerk/clerk-react';
import { SpotlightCard } from '@/components/blocks/SpotlightCard';
import { useToast } from '../components/ui/toast';

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
  const [hotProblems, setHotProblems] = useState<HotProblem[]>([]);
  const { toast } = useToast();
  const { isLoaded: authLoaded, isSignedIn, getToken } = useAuth();
  

  
  // Fetch problems from API
  const fetchProblems = async () => {
    if (!isSignedIn) {
      toast({
        title: 'Please sign in to view problems',
        description: 'You need to be signed in to view problems.',
        variant: "error",
      });
      return;
    }
    
    try {
      // setIsLoading(true); // Removed as per edit hint
      const problemsData = await getProblems({ limit: 100 });
      
      if (problemsData && Array.isArray(problemsData)) {
        // setProblems(problemsData); // Removed as per edit hint
        
        // Update category counts using the new category field
        const categoryCounts = problemsData.reduce((acc: any, problem: any) => {
          if (problem.category) {
            acc[problem.category] = (acc[problem.category] || 0) + 1;
          }
          return acc;
        }, {});
        
        // Update categories with counts
        problemCategories.forEach(category => {
          category.count = categoryCounts[category.id] || 0;
        });
      }
    } catch (err) {
      console.error('Error fetching problems:', err);
      toast({
        title: 'Failed to load problems',
        description: 'Failed to load problems. Please try again later.',
        variant: "error",
      });
    } finally {
      // setIsLoading(false); // Removed as per edit hint
    }
  };
  
  // Load animations
  useEffect(() => {
    const loadAnimations = async () => {
      try {
        await Promise.all([
          fetch('/Cat Movement.json'),
          fetch('/Stress Management.json')
        ]);
        
        // Removed as per edit hint
        // setCatAnimation(catData); // Removed as per edit hint
        // setStressAnimation(stressData); // Removed as per edit hint
      } catch (error) {
        console.error('Error loading animations:', error);
      }
    };
    
    loadAnimations();
  }, []);

  // Load trending problems from API
  useEffect(() => {
    const loadTrending = async () => {
      try {
        const trending = await getTrendingProblems(3);
        const mapped: HotProblem[] = (trending as ITrendingProblem[]).map((t) => ({
          id: t.problemId,
          title: t.title,
          difficulty: t.difficulty,
          category: t.category || 'general',
          solvedCount: t.solvedCount,
          trending: true,
        }));
        setHotProblems(mapped);
      } catch (err) {
        console.warn('Failed to load trending problems, falling back to empty list', err);
        setHotProblems([]);
      }
    };
    loadTrending();
  }, []);
  
  // Initial load
  useEffect(() => {
    if (authLoaded && isSignedIn) {
      fetchProblems();
    }
  }, [authLoaded, isSignedIn]);

  // Handle category selection
  const handleCategoryClick = (categoryId: string) => {
    // setSelectedCategory(categoryId); // Removed as per edit hint
    navigate(`/${username}/crucible/category/${categoryId}`);
  };

  // Handle hot problem click with analysis check
  const handleHotProblemClick = async (problemId: string) => {
    // Set loading state for this problem
    // setCheckingAnalysis(problemId); // Removed as per edit hint
    
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
      // setCheckingAnalysis(null); // Removed as per edit hint
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
      {/* Categories Section */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-3xl font-bold text-base-content mb-3">Choose Your Challenge</h2>
          <p className="text-base-content/60 text-lg">Explore problems by category and find your next challenge</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {problemCategories.map((category) => (
            <div key={category.id} onClick={() => handleCategoryClick(category.id)}>
              <SpotlightCard className="cursor-pointer">
                <div className={`p-6 rounded-xl border-2 transition-all duration-300 ${category.bgColor} ${category.borderColor} hover:border-opacity-40 h-full`}> 
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
          {/* Removed 'View all' per requirements */}
        </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {hotProblems.map((problem) => (
             <div key={problem.id} onClick={() => handleHotProblemClick(problem.id)}>
               <SpotlightCard className="cursor-pointer">
                 <div className={cn(
                   "p-6 rounded-xl border border-base-300 hover:border-primary/30 transition-all duration-300 group relative",
                   // Removed checkingAnalysis === problem.id && "opacity-75" // Removed as per edit hint
                 )}>
                   {/* Removed checkingAnalysis === problem.id && ( // Removed as per edit hint
                     <div className="absolute inset-0 bg-base-100/80 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
                       <div className="flex items-center gap-2 text-primary">
                         <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                         <span className="text-sm">Checking...</span>
                       </div>
                     </div>
                   ) */}
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