import { useNavigate, useParams } from 'react-router-dom';
// Remove broken import
// import CrucibleBrowseView, { type Problem } from '../components/crucible/CrucibleBrowseView';
import ProblemCard, { type Problem } from '../components/crucible/ProblemCard';
// Assume these hooks are available
// import { useCrucibleProblems, useCrucibleSolution } from '@/hooks/crucible';
import { useState, useEffect } from 'react';
import { Search, X, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn, logger } from '@/lib/utils';
import { getProblems } from '@/lib/crucibleApi';
import { useAuth } from '@clerk/clerk-react';

// Create a simple toast implementation since we don't have the UI component
const useToast = () => {
  const toast = ({ title, description }: { title: string; description: string; variant?: string }) => {
    logger.log(`${title}: ${description}`);
    // In a real implementation, this would show a toast notification
  };
  
  return { toast };
};

// Mapping function to convert API response to Problem type
const mapApiProblemToUiProblem = (apiProblem: any): Problem => {
  if (!apiProblem || typeof apiProblem !== 'object') {
    return {
      id: 'error',
      title: 'Error loading problem',
      description: 'There was an error loading this problem',
      difficulty: 'medium',
      tags: ['error'],
    };
  }
  
  // Destructure for better performance
  const { _id, id, title, description, difficulty, tags = [] } = apiProblem;
  
  // Handle MongoDB ObjectId in various formats
  let problemId = 'unknown-id';
  
  if (_id) {
    if (typeof _id === 'string') {
      // Simple string ID
      problemId = _id;
    } else if (typeof _id === 'object') {
      if (_id.$oid) {
        // MongoDB extended JSON format: { $oid: "..." }
        problemId = _id.$oid;
      } else if (typeof _id.toString === 'function') {
        // MongoDB ObjectId object with toString method
        problemId = _id.toString();
      }
    }
  } else if (id) {
    // Fallback to id if _id is not available
    problemId = typeof id === 'string' ? id : String(id);
  }
  
  // Handle tags that might be a single string with comma-separated values
  let normalizedTags = tags;
  if (!Array.isArray(tags) && typeof tags === 'string') {
    normalizedTags = tags.split(',').map(tag => tag.trim());
  } else if (!Array.isArray(tags)) {
    normalizedTags = [];
  }
  
  return {
    id: problemId,
    title: title || 'Untitled Problem',
    description: description || 'No description available',
    difficulty: difficulty || 'medium',
    tags: normalizedTags,
  };
};

// Skeleton loader component for problem cards
function ProblemCardSkeleton() {
  return (
    <div className="border rounded-lg p-4 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-4/6 mb-4"></div>
      <div className="flex gap-2 mt-4">
        <div className="h-6 bg-gray-200 rounded w-16"></div>
        <div className="h-6 bg-gray-200 rounded w-16"></div>
      </div>
    </div>
  );
}



// Get all unique tags from problems
const getAllTags = (problems: Problem[]): string[] => {
  const tagSet = new Set<string>();
  problems.forEach(problem => {
    problem.tags.forEach(tag => tagSet.add(tag));
  });
  return Array.from(tagSet).sort();
};

// Create mock data for testing
const mockProblems: Problem[] = [
  {
    id: 'mock1',
    title: 'Mock Problem 1',
    description: 'This is a mock problem for testing when the API does not return data correctly',
    difficulty: 'medium',
    tags: ['mock', 'test'],
  },
  {
    id: 'mock2',
    title: 'Mock Problem 2',
    description: 'Another mock problem for testing',
    difficulty: 'easy',
    tags: ['mock', 'test', 'easy'],
  },
];

export default function CruciblePage() {
  const navigate = useNavigate();
  const { username } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [filteredProblems, setFilteredProblems] = useState<Problem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { toast } = useToast();
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  
  // Force loading state to end after 10 seconds maximum
  useEffect(() => {
    if (!isLoading) return;
    
    const forceTimeout = setTimeout(() => {
      if (isLoading) {
        logger.log('Force ending loading state after timeout');
        setIsLoading(false);
      }
    }, 10000);
    
    return () => clearTimeout(forceTimeout);
  }, [isLoading]);
  
  // Fetch problems from API
  const fetchProblems = async (pageNum = 1) => {
    if (!isSignedIn) {
      setError('Please sign in to view problems');
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      
      const filters = { page: pageNum, limit: 10 };
      const problemsData = await getProblems(filters);
      
      if (problemsData && Array.isArray(problemsData)) {
        const newProblems = problemsData.map(mapApiProblemToUiProblem);
        
        if (pageNum === 1) {
          setProblems(newProblems);
          setFilteredProblems(newProblems);
        } else {
          setProblems(prev => [...prev, ...newProblems]);
          setFilteredProblems(prev => [...prev, ...newProblems]);
        }
        
        // Check if there are more pages
        setHasMore(newProblems.length === 10);
        
        // If no problems were found, use mock data
        if (newProblems.length === 0 && pageNum === 1) {
          logger.warn('No problems returned from API, using mock data');
          setProblems(mockProblems);
          setFilteredProblems(mockProblems);
          setHasMore(false);
        }
      } else {
        // Use mock data as fallback if no data is returned
        if (pageNum === 1) {
          logger.warn('Invalid response format from API, using mock data');
          setProblems(mockProblems);
          setFilteredProblems(mockProblems);
          setHasMore(false);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load problems';
      logger.error('Error fetching problems:', err);
      
      // Check if it's an authentication error
      if (err instanceof Error && (
        errorMessage.includes('Unauthenticated') || 
        errorMessage.includes('Authentication') ||
        errorMessage.includes('401') ||
        errorMessage.includes('403')
      )) {
        setError('Please sign in to view problems');
      } else if (err instanceof Error && errorMessage.includes('429')) {
        // Handle rate limiting
        setError('Too many requests. Please wait a moment before trying again.');
        setTimeout(() => {
          fetchProblems(pageNum);
        }, 5000); // Retry after 5 seconds
        
        // Don't clear loading state yet
        return;
      } else {
        setError(errorMessage);
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }
      
      // Use mock data as fallback on error for first page
      if (pageNum === 1) {
        setProblems(mockProblems);
        setFilteredProblems(mockProblems);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load more function
  const loadMore = () => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProblems(nextPage);
    }
  };
  
  // Initial load
  useEffect(() => {
    if (authLoaded && isSignedIn) {
      fetchProblems(1);
    }
  }, [authLoaded, isSignedIn]);
  
  // Filter problems based on search query and selected tags
  useEffect(() => {
    const filtered = problems.filter(problem => {
      // Search query filter
      const matchesQuery = searchQuery === '' || 
        problem.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        problem.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Tags filter (AND logic)
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.every(tag => problem.tags.includes(tag));
      
      return matchesQuery && matchesTags;
    });
    
    setFilteredProblems(filtered);
  }, [searchQuery, selectedTags, problems]);

  // Get all unique tags
  const allTags = getAllTags(problems);

  // Toggle tag selection
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };

  // Clear all selected tags
  const clearTags = () => {
    setSelectedTags([]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 min-h-screen">
      {/* Search Bar */}
      <div className="relative w-full max-w-md mx-auto mb-4">
        <input
          type="text"
          className="rounded-full pl-10 pr-8 py-2 text-sm bg-base-100 border border-base-300 shadow-sm focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200 text-base-content placeholder:text-base-content/60 w-full"
          placeholder="Search challenges..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search challenges"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/60 pointer-events-none">
          <Search className="w-4 h-4" />
        </span>
        {searchQuery && (
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-base-content/60 hover:text-error hover:bg-error/10 transition-colors"
            tabIndex={0}
            aria-label="Clear search"
            onClick={() => setSearchQuery('')}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      {/* Tags Filter */}
      <div className="mb-4 border-b border-base-300 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {allTags.map(tag => (
            <Badge 
              key={tag}
              variant={selectedTags.includes(tag) ? "default" : "outline"}
              className={cn(
                "px-3 py-1 rounded-full cursor-pointer text-xs capitalize transition-all hover:scale-105",
                selectedTags.includes(tag) ? "bg-primary text-primary-foreground" : "hover:bg-accent bg-base-200 text-base-content border-none"
              )}
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </Badge>
          ))}
          {selectedTags.length > 0 && (
            <Badge 
              variant="secondary"
              className="px-3 py-1 rounded-full cursor-pointer text-xs flex items-center gap-1 hover:bg-secondary/80 transition-all"
              onClick={clearTags}
            >
              Clear all <X className="w-3 h-3" />
            </Badge>
          )}
        </div>
      </div>
      {/* Problem Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-1">
        {isLoading ? (
          Array(6).fill(0).map((_, i) => <ProblemCardSkeleton key={i} />)
        ) : error ? (
          <div className="col-span-full text-center text-error py-12">
            <AlertCircle className="w-12 h-12 mx-auto mb-4" />
            <p className="text-lg font-medium">{error}</p>
          </div>
        ) : filteredProblems.length === 0 ? (
          <div className="col-span-full text-center text-base-content/60 py-12">No problems found</div>
        ) : (
          filteredProblems.map((problem) => (
            <ProblemCard key={problem.id} problem={problem} onSelect={(p) => navigate(`/${username}/crucible/problem/${p.id}`)} />
          ))
        )}
      </div>
      {/* Load More Button */}
      {hasMore && !isLoading && filteredProblems.length > 0 && (
        <div className="flex justify-center mt-6">
          <button 
            className="px-5 py-2 rounded-full bg-primary text-primary-foreground font-semibold shadow hover:bg-primary/90 transition-colors"
            onClick={loadMore}
          >
            Load More
          </button>
        </div>
      )}
      {/* No results message */}
      {!isLoading && filteredProblems.length === 0 && problems.length > 0 && (
        <div className="flex flex-col items-center justify-center py-8">
          <p className="text-lg font-medium text-base-content/70">No challenges match your filters</p>
          <button 
            className="mt-3 text-primary hover:underline"
            onClick={() => {
              setSearchQuery('');
              setSelectedTags([]);
            }}
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
} 