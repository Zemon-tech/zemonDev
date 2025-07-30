import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Search, X, ArrowLeft, Filter, Clock, Users, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getProblems } from '@/lib/crucibleApi';
import { useAuth } from '@clerk/clerk-react';
import { SpotlightCard } from '@/components/blocks/SpotlightCard';
import { GradientText } from '@/components/blocks/GradientText';

// Category information mapping with SVG icons
const categoryInfo = {
  algorithms: {
    name: 'Algorithms',
    description: 'Data structures, sorting, searching, and algorithmic thinking',
    icon: '/svg.icons/github-svgrepo-com.svg',
    technologies: ['Python', 'Java', 'JavaScript'],
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20'
  },
  'system-design': {
    name: 'System Design',
    description: 'Scalable architectures, distributed systems, and design patterns',
    icon: '/svg.icons/aws-svgrepo-com.svg',
    technologies: ['AWS', 'Docker', 'Kubernetes', 'Redis', 'MongoDB', 'PostgreSQL'],
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20'
  },
  'web-development': {
    name: 'Web Development',
    description: 'Frontend, backend, APIs, and modern web technologies',
    icon: '/svg.icons/react-svgrepo-com.svg',
    technologies: ['React', 'Node.js', 'Express.js', 'Vue.js', 'Angular', 'TypeScript'],
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20'
  },
  'mobile-development': {
    name: 'Mobile Development',
    description: 'iOS, Android, React Native, and mobile app challenges',
    icon: '/svg.icons/flutter-svgrepo-com.svg',
    technologies: ['React Native', 'Flutter', 'iOS', 'Android'],
    color: 'from-yellow-500 to-orange-500',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/20'
  },
  'data-science': {
    name: 'Data Science',
    description: 'Machine learning, data analysis, and statistical modeling',
    icon: '/svg.icons/tensorflow-enterprise-svgrepo-com.svg',
    technologies: ['Python', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy'],
    color: 'from-red-500 to-pink-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20'
  },
  devops: {
    name: 'DevOps',
    description: 'CI/CD, cloud infrastructure, and deployment strategies',
    icon: '/svg.icons/jenkins-svgrepo-com.svg',
    technologies: ['Docker', 'Kubernetes', 'Jenkins', 'AWS', 'Git'],
    color: 'from-indigo-500 to-blue-500',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/20'
  },
  frontend: {
    name: 'Frontend',
    description: 'React, Vue, Angular, and modern UI/UX challenges',
    icon: '/svg.icons/react-svgrepo-com.svg',
    technologies: ['React', 'Vue.js', 'Angular', 'TypeScript', 'Tailwind CSS'],
    color: 'from-teal-500 to-cyan-500',
    bgColor: 'bg-teal-500/10',
    borderColor: 'border-teal-500/20'
  },
  backend: {
    name: 'Backend',
    description: 'Node.js, Python, Java, and server-side development',
    icon: '/svg.icons/nodejs-icon-svgrepo-com.svg',
    technologies: ['Node.js', 'Express.js', 'Python', 'Java', 'MongoDB', 'PostgreSQL'],
    color: 'from-amber-500 to-yellow-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20'
  }
};

export default function CrucibleCategoryPage() {
  const navigate = useNavigate();
  const { username, categoryId } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [problems, setProblems] = useState<any[]>([]);
  const [filteredProblems, setFilteredProblems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'difficulty'>('latest');
  const { isLoaded: authLoaded, isSignedIn } = useAuth();

  const category = categoryInfo[categoryId as keyof typeof categoryInfo];
  
  // Debug logging
  console.log('Category ID:', categoryId);
  console.log('Category:', category);

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
        // Filter problems by category
        const categoryProblems = problemsData.filter((problem: any) => 
          problem.tags && problem.tags.includes(categoryId)
        );
        
        setProblems(categoryProblems);
        setFilteredProblems(categoryProblems);
      }
    } catch (err) {
      console.error('Error fetching problems:', err);
      setError('Failed to load problems');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (authLoaded && isSignedIn && categoryId) {
      fetchProblems();
    }
  }, [authLoaded, isSignedIn, categoryId]);

  // Filter and sort problems
  useEffect(() => {
    let filtered = problems.filter(problem => 
      searchQuery === '' || 
      problem.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      problem.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort problems
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'latest':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case 'popular':
          return (b.metrics?.attempts || 0) - (a.metrics?.attempts || 0);
        case 'difficulty':
          const difficultyOrder: Record<string, number> = { 'easy': 1, 'medium': 2, 'hard': 3, 'expert': 4 };
          return (difficultyOrder[a.difficulty] || 0) - (difficultyOrder[b.difficulty] || 0);
        default:
          return 0;
      }
    });

    setFilteredProblems(filtered);
  }, [searchQuery, sortBy, problems]);

  // Handle problem click
  const handleProblemClick = (problemId: string) => {
    navigate(`/${username}/crucible/problem/${problemId}`);
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

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-base-content mb-4">Category Not Found</h1>
          <button 
            onClick={() => navigate(`/${username}/crucible`)}
            className="text-primary hover:text-primary/80"
          >
            Back to Crucible
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-50 to-base-100">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate(`/${username}/crucible`)}
            className="flex items-center gap-2 text-base-content/60 hover:text-base-content transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Categories
          </button>
        </div>

        {/* Category Header */}
        <div className={`p-8 rounded-2xl ${category.bgColor} ${category.borderColor} border-2 mb-8`}>
          <div className="flex items-center gap-6 mb-6">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center">
              <img src={category.icon} alt={category.name} className="w-10 h-10" />
            </div>
            <div className="flex-1">
              <h1 className="text-5xl font-bold mb-3 text-base-content">
                {category.name}
              </h1>
              <p className="text-lg text-base-content/70">{category.description}</p>
            </div>
          </div>
          
          {/* Technology Icons */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-base-content/60 mb-3">Technologies</h3>
            <div className="flex flex-wrap gap-3">
              {category.technologies.map((tech, index) => {
                const techIconMap: { [key: string]: string } = {
                  'React': '/svg.icons/react-svgrepo-com.svg',
                  'Node.js': '/svg.icons/nodejs-icon-svgrepo-com.svg',
                  'Express.js': '/svg.icons/icons8-express-js.svg',
                  'Vue.js': '/svg.icons/vue-dot-js-svgrepo-com.svg',
                  'Angular': '/svg.icons/angular-svgrepo-com.svg',
                  'TypeScript': '/svg.icons/typescript-svgrepo-com.svg',
                  'Tailwind CSS': '/svg.icons/tailwind-svgrepo-com.svg',
                  'Python': '/svg.icons/python-svgrepo-com.svg',
                  'Java': '/svg.icons/java-svgrepo-com.svg',
                  'JavaScript': '/svg.icons/js-svgrepo-com.svg',
                  'AWS': '/svg.icons/aws-svgrepo-com.svg',
                  'Docker': '/svg.icons/docker-svgrepo-com.svg',
                  'Kubernetes': '/svg.icons/kubernetes-svgrepo-com.svg',
                  'Redis': '/svg.icons/redis-svgrepo-com.svg',
                  'MongoDB': '/svg.icons/mongodb-svgrepo-com.svg',
                  'PostgreSQL': '/svg.icons/pgsql-svgrepo-com.svg',
                  'Jenkins': '/svg.icons/jenkins-svgrepo-com.svg',
                  'Git': '/svg.icons/github-svgrepo-com.svg',
                  'GitHub': '/svg.icons/github-svgrepo-com.svg',
                  'Flutter': '/svg.icons/flutter-svgrepo-com.svg',
                  'React Native': '/svg.icons/reacttemplate-svgrepo-com.svg',
                  'iOS': '/svg.icons/ios-svgrepo-com.svg',
                  'Android': '/svg.icons/android-color-svgrepo-com.svg',
                  'TensorFlow': '/svg.icons/tensorflow-enterprise-svgrepo-com.svg',
                  'PyTorch': '/svg.icons/pytorch-svgrepo-com.svg',
                  'Pandas': '/svg.icons/panda-bear-panda-svgrepo-com.svg',
                  'NumPy': '/svg.icons/numpy-svgrepo-com.svg'
                };
                
                const iconPath = techIconMap[tech];
                return (
                  <div key={index} className="flex items-center gap-2 px-3 py-2 bg-base-100/50 rounded-lg border border-base-300">
                    {iconPath ? (
                      <img src={iconPath} alt={tech} className="w-5 h-5" />
                    ) : (
                      <div className="w-5 h-5 bg-base-300 rounded"></div>
                    )}
                    <span className="text-sm font-medium text-base-content/80">{tech}</span>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-base-content/60">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {filteredProblems.length} problems
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Updated recently
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
            <input
              type="text"
              className="w-full pl-10 pr-10 py-3 bg-base-100 border border-base-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-base-content placeholder:text-base-content/60"
              placeholder="Search problems..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-base-content/60 hover:text-error hover:bg-error/10 transition-colors"
                onClick={() => setSearchQuery('')}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-base-content/40" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-3 bg-base-100 border border-base-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-base-content"
            >
              <option value="latest">Latest</option>
              <option value="popular">Most Popular</option>
              <option value="difficulty">By Difficulty</option>
            </select>
          </div>
        </div>

        {/* Problems Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="p-6 rounded-xl border border-base-300 animate-pulse">
                <div className="h-4 bg-base-300 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-base-300 rounded w-full mb-2"></div>
                <div className="h-3 bg-base-300 rounded w-5/6 mb-4"></div>
                <div className="flex gap-2">
                  <div className="h-6 bg-base-300 rounded w-16"></div>
                  <div className="h-6 bg-base-300 rounded w-16"></div>
                </div>
              </div>
            ))
          ) : error ? (
            <div className="col-span-full text-center py-12">
              <p className="text-lg font-medium text-error">{error}</p>
            </div>
          ) : filteredProblems.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-lg font-medium text-base-content/60">No problems found</p>
              {searchQuery && (
                <button 
                  className="mt-3 text-primary hover:underline"
                  onClick={() => setSearchQuery('')}
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            filteredProblems.map((problem) => (
              <div key={problem._id || problem.id} onClick={() => handleProblemClick(problem._id || problem.id)}>
                <SpotlightCard className="cursor-pointer">
                  <div className="p-6 rounded-xl border border-base-300 hover:border-primary/30 transition-all duration-300 group">
                    <div className="flex items-start justify-between mb-3">
                      <Badge className={cn("text-xs", getDifficultyColor(problem.difficulty))}>
                        {problem.difficulty}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-base-content/40">
                        <Star className="w-3 h-3" />
                        {problem.metrics?.attempts || 0}
                      </div>
                    </div>
                    <h3 className="font-semibold text-base-content mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {problem.title}
                    </h3>
                    <p className="text-sm text-base-content/70 mb-4 line-clamp-3">
                      {problem.description}
                    </p>
                    <div className="flex items-center justify-between text-sm text-base-content/60">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {problem.metrics?.solutions || 0} solutions
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {problem.estimatedTime ? `${problem.estimatedTime}min` : 'N/A'}
                      </div>
                    </div>
                  </div>
                </SpotlightCard>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 