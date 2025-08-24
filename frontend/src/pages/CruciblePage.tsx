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
  const [problems, setProblems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { isLoaded: authLoaded, isSignedIn, getToken } = useAuth();
  
  // Initialize and fetch data
  useEffect(() => {
    if (authLoaded && isSignedIn) {
      // Fetch data from API
      fetchProblems();
      fetchTrendingProblems();
    }
  }, [authLoaded, isSignedIn]);
  
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
      setIsLoading(true);
      const problemsData = await getProblems({ limit: 100 });
      
      if (problemsData && Array.isArray(problemsData) && problemsData.length > 0) {
        // Update with fresh data from API
        setProblems(problemsData);
        
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
      // If API returns empty or fails, show empty state
    } catch (err) {
      console.error('Error fetching problems from API:', err);
      setProblems([]);
      toast({
        title: 'Error loading problems',
        description: 'Failed to load problems. Please try again later.',
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch trending problems from API
  const fetchTrendingProblems = async () => {
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
  
  // Handle category selection
  const handleCategoryClick = (categoryId: string) => {
    navigate(`/${username}/crucible/category/${categoryId}`);
  };

  // Handle hot problem click with analysis check
  const handleHotProblemClick = async (problemId: string) => {
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

  // Add custom styles for line-clamp functionality
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
        word-break: break-word;
      }
      
      .line-clamp-3 {
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
        word-break: break-word;
      }
      
      /* Ensure titles don't wrap and are properly truncated */
      .problem-title {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
        word-break: break-word;
        line-height: 1.2;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

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
                <div className={`p-5 rounded-2xl border-2 transition-all duration-300 ${category.bgColor} ${category.borderColor} hover:border-opacity-60 hover:shadow-lg h-64 w-full backdrop-blur-sm`}> 
                  {/* Category Icon */}
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                    <category.icon className="w-6 h-6 text-white" />
                  </div>
                  
                  {/* Category Name */}
                  <h3 className="text-lg font-bold text-base-content mb-3 leading-tight">{category.name}</h3>
                  
                  {/* Category Description */}
                  <p className="text-sm text-base-content/70 leading-relaxed mb-5 line-clamp-2 min-h-[2.5rem] overflow-hidden">{category.description}</p>
                  
                  {/* Bottom Info Bar */}
                  <div className="flex items-center justify-between absolute bottom-5 left-5 right-5">
                    <Badge variant="secondary" className="text-xs font-medium px-2.5 py-1 rounded-full bg-base-200/80 dark:bg-base-700/80">
                      {category.count} problems
                    </Badge>
                    <div className="w-8 h-8 bg-base-200/50 dark:bg-base-700/50 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <ArrowRight className="w-4 h-4 text-base-content/60 group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                  
                  {/* Hover Effect Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-base-content/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none" />
                </div>
              </SpotlightCard>
            </div>
          ))}
        </div>
      </div>

      {/* Problems Display Section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-base-content mb-2">Available Problems</h2>
            <p className="text-base-content/60">
              {isLoading ? 'Refreshing problems...' : `${problems.length} problems available`}
            </p>
          </div>
          {isLoading && (
            <div className="flex items-center gap-2 text-primary">
              <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              <span className="text-sm">Updating...</span>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {problems.map((problem) => (
            <div key={problem._id} onClick={() => handleHotProblemClick(problem._id)}>
              <SpotlightCard className="cursor-pointer">
                <div className="p-5 rounded-2xl border border-base-300/50 hover:border-primary/40 hover:shadow-lg transition-all duration-300 group relative h-72 w-full bg-gradient-to-br from-base-100 to-base-50/50 backdrop-blur-sm">
                  {/* Difficulty and Category Badges */}
                  <div className="flex items-start justify-between mb-4">
                    <Badge className={cn("text-xs font-medium px-2.5 py-1 rounded-full", getDifficultyColor(problem.difficulty))}>
                      {problem.difficulty}
                    </Badge>
                    <Badge variant="outline" className="text-xs font-medium px-2.5 py-1 rounded-full border-base-300/60 text-base-content/70">
                      {problem.category}
                    </Badge>
                  </div>
                  
                  {/* Problem Title */}
                  <h3 className="problem-title font-bold text-base-content text-lg mb-3 group-hover:text-primary transition-colors min-h-[3.5rem]">
                    {problem.title}
                  </h3>
                  
                  {/* Problem Description */}
                  <p className="text-sm text-base-content/70 leading-relaxed mb-5 line-clamp-3 min-h-[4rem]">
                    {problem.description}
                  </p>
                  
                  {/* Bottom Info Bar */}
                  <div className="flex items-center justify-between text-xs text-base-content/60 absolute bottom-5 left-5 right-5">
                    <div className="flex items-center gap-2 bg-base-200/50 dark:bg-base-700/50 px-3 py-1.5 rounded-full">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="font-medium">{problem.estimatedTime}m</span>
                    </div>
                    <div className="flex items-center gap-2 bg-base-200/50 dark:bg-base-700/50 px-3 py-1.5 rounded-full">
                      <Target className="w-3.5 h-3.5" />
                      <span className="font-medium">{problem.tags.slice(0, 2).join(', ')}</span>
                    </div>
                  </div>
                  
                  {/* Hover Effect Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none" />
                </div>
              </SpotlightCard>
            </div>
          ))}
        </div>
        
        {problems.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="text-base-content/40 text-lg">No problems available at the moment</div>
            <div className="text-base-content/30 text-sm mt-2">Check back later for new challenges</div>
          </div>
        )}
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
                  <div className="p-5 rounded-2xl border border-base-300/50 hover:border-primary/40 hover:shadow-lg transition-all duration-300 group relative h-64 w-full bg-gradient-to-br from-base-100 to-base-50/50 backdrop-blur-sm">
                    {/* Difficulty Badge and Trending Icon */}
                    <div className="flex items-start justify-between mb-4">
                      <Badge className={cn("text-xs font-medium px-2.5 py-1 rounded-full", getDifficultyColor(problem.difficulty))}>
                        {problem.difficulty}
                      </Badge>
                      {problem.trending && (
                        <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center">
                          <TrendingUp className="w-4 h-4 text-orange-500" />
                        </div>
                      )}
                    </div>
                    
                    {/* Problem Title */}
                    <h3 className="problem-title font-bold text-base-content text-lg mb-4 group-hover:text-primary transition-colors min-h-[3.5rem]">
                      {problem.title}
                    </h3>
                    
                    {/* Bottom Info Bar */}
                    <div className="flex items-center justify-between text-xs text-base-content/60 absolute bottom-5 left-5 right-5">
                      <div className="flex items-center gap-2 bg-base-200/50 dark:bg-base-700/50 px-3 py-1.5 rounded-full">
                        <Users className="w-3.5 h-3.5" />
                        <span className="font-medium">{problem.solvedCount} solved</span>
                      </div>
                      <div className="flex items-center gap-2 bg-base-200/50 dark:bg-base-700/50 px-3 py-1.5 rounded-full">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="font-medium">Latest</span>
                      </div>
                    </div>
                    
                    {/* Hover Effect Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none" />
                  </div>
                </SpotlightCard>
              </div>
            ))}
          </div>
      </div>


    </div>
  );
} 