import { useNavigate, useParams } from 'react-router-dom';
// Remove broken import
// import CrucibleBrowseView, { type Problem } from '../components/crucible/CrucibleBrowseView';
import ProblemCard, { type Problem } from '../components/crucible/ProblemCard';
// Assume these hooks are available
// import { useCrucibleProblems, useCrucibleSolution } from '@/hooks/crucible';
import { useState, useEffect, useRef } from 'react';
import { Search, X, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getProblems } from '@/lib/crucibleApi';
import { useClerkToken } from '@/lib/middleware';
import { useAuth } from '@clerk/clerk-react';

// Create a simple toast implementation since we don't have the UI component
const useToast = () => {
  const toast = ({ title, description, variant }: { title: string; description: string; variant?: string }) => {
    console.log(`${title}: ${description}`);
    // In a real implementation, this would show a toast notification
  };
  
  return { toast };
};

// Mapping function to convert API response to Problem type
const mapApiProblemToUiProblem = (apiProblem: any): Problem => {
  console.log('Mapping API problem:', apiProblem);
  
  // Check if the problem has the expected structure
  if (!apiProblem || typeof apiProblem !== 'object') {
    console.error('Invalid problem object:', apiProblem);
    return {
      id: 'error',
      title: 'Error loading problem',
      description: 'There was an error loading this problem',
      difficulty: 'medium',
      tags: ['error'],
    };
  }
  
  // Handle different possible field names
  const id = apiProblem._id || apiProblem.id || 'unknown-id';
  const title = apiProblem.title || 'Untitled Problem';
  const description = apiProblem.description || 'No description available';
  const difficulty = apiProblem.difficulty || 'medium';
  const tags = Array.isArray(apiProblem.tags) ? apiProblem.tags : [];
  
  return {
    id,
    title,
    description,
    difficulty,
    tags,
  };
};

// Crucible Browse View component
function CrucibleBrowseView({ problems, loading, onSelect }: { problems: Problem[]; loading: boolean; onSelect: (p: Problem) => void }) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (problems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
        <p className="text-lg font-medium text-muted-foreground">No problems found</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {problems.map((problem) => (
        <ProblemCard key={problem.id} problem={problem} onSelect={onSelect} />
      ))}
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
  const { toast } = useToast();
  
  // Ensure auth token is set
  useClerkToken();
  const { isLoaded: authLoaded, isSignedIn, getToken } = useAuth();
  
  // Use a ref to track if data has been fetched
  const hasFetchedRef = useRef(false);

  // Debug logging for component state
  useEffect(() => {
    console.log('CruciblePage state:', { 
      isLoading, 
      problemsCount: problems.length, 
      filteredCount: filteredProblems.length,
      hasFetched: hasFetchedRef.current,
      error
    });
  }, [isLoading, problems.length, filteredProblems.length, error]);
  
  // Force loading state to end after 10 seconds maximum
  useEffect(() => {
    if (!isLoading) return;
    
    const forceTimeout = setTimeout(() => {
      if (isLoading) {
        console.log('Force ending loading state after timeout');
        setIsLoading(false);
      }
    }, 10000);
    
    return () => clearTimeout(forceTimeout);
  }, [isLoading]);
  
  // Fetch problems from API
  useEffect(() => {
    // Don't fetch data until auth is loaded
    if (!authLoaded) return;
    
    let isMounted = true;
    let loadingTimer: NodeJS.Timeout | null = null;
    let retryTimer: NodeJS.Timeout | null = null;
    
    async function fetchProblems() {
      // Prevent duplicate fetches
      if (hasFetchedRef.current) return;
      hasFetchedRef.current = true;
      
      if (!isMounted) return;
      
      // Add a small delay before showing the loading spinner to prevent flashing
      loadingTimer = setTimeout(() => {
        if (isMounted) {
          setIsLoading(true);
        }
      }, 300);
      
      setError(null);
      
      try {
        // Only attempt to fetch if signed in
        if (!isSignedIn) {
          setError('Please sign in to view problems');
          if (loadingTimer) clearTimeout(loadingTimer);
          setIsLoading(false);
          return;
        }
        
        console.log('Fetching problems...');
        
        // Get the auth token from Clerk
        const token = await getToken();
        console.log('Got auth token:', token ? 'yes' : 'no');
        
        // Simple fetch approach
        const response = await fetch('/api/crucible', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API Response:', data);
        
        // Use mock data for now to ensure we see something
        setProblems(mockProblems);
        setFilteredProblems(mockProblems);
        
        // Try to extract real data if possible
        if (data && data.data && data.data.challenges && Array.isArray(data.data.challenges)) {
          const realProblems = data.data.challenges.map(mapApiProblemToUiProblem);
          if (realProblems.length > 0) {
            setProblems(realProblems);
            setFilteredProblems(realProblems);
          }
        }
      } catch (err) {
        if (!isMounted) return;
        
        const errorMessage = err instanceof Error ? err.message : 'Failed to load problems';
        console.error('Error fetching problems:', err);
        
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
          // Set a retry timer
          if (retryTimer) clearTimeout(retryTimer);
          retryTimer = setTimeout(() => {
            if (isMounted) {
              console.log('Retrying API call...');
              hasFetchedRef.current = false; // Reset fetch flag to allow retry
              fetchProblems();
            }
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
        
        // Use mock data as fallback on error
        console.warn('Error fetching problems, using mock data as fallback');
        setProblems(mockProblems);
        setFilteredProblems(mockProblems);
      } finally {
        if (isMounted) {
          // Clear the loading timer if it's still active
          if (loadingTimer) {
            clearTimeout(loadingTimer);
          }
          console.log('Setting loading state to false');
          setIsLoading(false);
        }
      }
    }
    
    fetchProblems();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
      if (loadingTimer) {
        clearTimeout(loadingTimer);
      }
      if (retryTimer) {
        clearTimeout(retryTimer);
      }
    };
  }, [toast, authLoaded, isSignedIn, getToken]); // Added getToken to dependencies

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
      <div className="relative w-full mb-3">
        <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
          <Search className="w-5 h-5 text-muted-foreground" />
        </div>
        <input
          type="text"
          className="bg-background border border-input rounded-2xl w-full py-3 ps-10 pe-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
          placeholder="Search challenges..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Tags Filter */}
      <div className="mb-4 border-b pb-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {allTags.map(tag => (
            <Badge 
              key={tag}
              variant={selectedTags.includes(tag) ? "default" : "outline"}
              className={cn(
                "px-3 py-1 rounded-full cursor-pointer text-xs capitalize transition-all hover:scale-105",
                selectedTags.includes(tag) ? "bg-primary text-primary-foreground" : "hover:bg-accent"
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

      {/* Problem Cards */}
      <CrucibleBrowseView
        problems={filteredProblems}
        loading={isLoading}
        onSelect={(problem) => {
          navigate(`/${username}/crucible/problem/${problem.id}`);
        }}
      />

      {/* No results message */}
      {!isLoading && filteredProblems.length === 0 && problems.length > 0 && (
        <div className="flex flex-col items-center justify-center py-8">
          <p className="text-lg font-medium text-muted-foreground">No challenges match your filters</p>
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
      
      {/* Error message */}
      {error && (
        <div className="flex flex-col items-center justify-center py-8">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-lg font-medium text-red-500">Error loading problems</p>
          <p className="text-muted-foreground">{error}</p>
          <button 
            className="mt-3 btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
} 