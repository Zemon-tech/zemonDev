import { useNavigate, useParams } from 'react-router-dom';
// Remove broken import
// import CrucibleBrowseView, { type Problem } from '../components/crucible/CrucibleBrowseView';
import ProblemCard, { type Problem } from '../components/crucible/ProblemCard';
// Assume these hooks are available
// import { useCrucibleProblems, useCrucibleSolution } from '@/hooks/crucible';
import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Dummy CrucibleBrowseView for now (since file is deleted)
function CrucibleBrowseView({ problems, loading, onSelect }: { problems: Problem[]; loading: boolean; onSelect: (p: Problem) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {problems.map((problem) => (
        <ProblemCard key={problem.id} problem={problem} onSelect={onSelect} />
      ))}
    </div>
  );
}

const dummyProblems: Problem[] = [
  {
    id: '1',
    title: 'Design a URL Shortener (like bit.ly)',
    description: 'Build a scalable service to shorten URLs, handle redirects, and track analytics. Consider database schema, unique code generation, and high availability.',
    difficulty: 'easy',
    tags: ['database', 'api', 'scaling', 'backend'],
  },
  {
    id: '2',
    title: 'Real-Time Chat System',
    description: 'Design a real-time chat application supporting 1:1 and group messaging, typing indicators, and message history. Discuss WebSocket usage and data storage.',
    difficulty: 'medium',
    tags: ['realtime', 'api', 'scaling', 'frontend', 'backend'],
  },
  {
    id: '3',
    title: 'Distributed Rate Limiter',
    description: 'Implement a distributed rate limiter for an API gateway. Discuss algorithms (token bucket, leaky bucket), storage (Redis), and consistency.',
    difficulty: 'hard',
    tags: ['api', 'scaling', 'backend', 'security'],
  },
  {
    id: '4',
    title: 'Design GitHub Gist',
    description: 'Build a system for users to create, edit, and share code snippets with versioning and permissions. Consider storage, search, and access control.',
    difficulty: 'medium',
    tags: ['database', 'frontend', 'backend', 'security'],
  },
  {
    id: '5',
    title: 'Notification Delivery System',
    description: 'Design a system to deliver notifications (email, SMS, push) to millions of users reliably and in near real-time. Discuss queuing, retries, and user preferences.',
    difficulty: 'expert',
    tags: ['scaling', 'backend', 'api', 'realtime'],
  },
  {
    id: '6',
    title: 'Design a Pastebin Service',
    description: 'Create a service for users to store and share text/code snippets. Discuss expiration, spam prevention, and syntax highlighting.',
    difficulty: 'easy',
    tags: ['frontend', 'backend', 'security'],
  },
  {
    id: '7',
    title: 'E-commerce Checkout System',
    description: 'Design a robust checkout system for an e-commerce platform. Cover inventory management, payment processing, and order tracking.',
    difficulty: 'hard',
    tags: ['api', 'database', 'security', 'backend'],
  },
  {
    id: '8',
    title: 'Design a News Feed (like Facebook)',
    description: 'Build a personalized, scalable news feed system. Discuss ranking algorithms, caching, and real-time updates.',
    difficulty: 'expert',
    tags: ['scaling', 'database', 'frontend', 'backend'],
  },
];

// Get all unique tags from problems
const getAllTags = (problems: Problem[]): string[] => {
  const tagSet = new Set<string>();
  problems.forEach(problem => {
    problem.tags.forEach(tag => tagSet.add(tag));
  });
  return Array.from(tagSet).sort();
};

export default function CruciblePage() {
  const navigate = useNavigate();
  const { username } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [filteredProblems, setFilteredProblems] = useState(dummyProblems);
  const allTags = getAllTags(dummyProblems);

  // Filter problems based on search query and selected tags
  useEffect(() => {
    const filtered = dummyProblems.filter(problem => {
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
  }, [searchQuery, selectedTags]);

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
    <div className="max-w-7xl mx-auto px-6 py-6 min-h-screen">
      {/* Search Bar */}
      <div className="relative w-full mb-4">
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
      <div className="mb-6 border-b pb-4">
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
        loading={false}
        onSelect={(problem) => {
          navigate(`/${username}/crucible/problem/${problem.id}`);
        }}
      />

      {/* No results message */}
      {filteredProblems.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-lg font-medium text-muted-foreground">No challenges match your filters</p>
          <button 
            className="mt-4 text-primary hover:underline"
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