import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Search, X, Filter, ArrowLeft, BookOpen, FileText, Film, Wrench, FolderGit2, FileBadge2 } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { getForgeResources, registerForgeResourceView, toggleBookmark, getBookmarkedResources } from '../lib/forgeApi';
import { ResourceCard } from '@/components/blocks/ResourceCard';
import type { Resource } from '@/components/blocks/ResourceCard';
import { Button } from '@/components/ui/button';
// Category information mapping with icons and colors
const categoryInfo = {
  course: {
    name: 'Courses',
    description: 'Structured learning paths, tutorials, and comprehensive guides',
    icon: BookOpen,
    technologies: ['React', 'Node.js', 'Python', 'JavaScript', 'TypeScript'],
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20'
  },
  repository: {
    name: 'Repositories',
    description: 'Open source projects, code examples, and GitHub resources',
    icon: FolderGit2,
    technologies: ['GitHub', 'GitLab', 'Bitbucket', 'Docker', 'Kubernetes'],
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20'
  },
  article: {
    name: 'Articles',
    description: 'In-depth technical articles, blog posts, and guides',
    icon: FileText,
    technologies: ['Medium', 'Dev.to', 'Hashnode', 'CSS-Tricks', 'Smashing Magazine'],
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20'
  },
  documentation: {
    name: 'Documentation',
    description: 'Official documentation, API references, and technical specs',
    icon: BookOpen,
    technologies: ['MDN', 'React Docs', 'Vue Docs', 'Angular Docs', 'Node.js Docs'],
    color: 'from-orange-500 to-red-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20'
  },
  video: {
    name: 'Videos',
    description: 'Video tutorials, courses, and educational content',
    icon: Film,
    technologies: ['YouTube', 'Udemy', 'Coursera', 'Pluralsight', 'Frontend Masters'],
    color: 'from-indigo-500 to-blue-500',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/20'
  },
  tool: {
    name: 'Tools',
    description: 'Development tools, utilities, and productivity resources',
    icon: Wrench,
    technologies: ['VS Code', 'Chrome DevTools', 'Postman', 'Figma', 'Notion'],
    color: 'from-yellow-500 to-orange-500',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/20'
  },
  case_study: {
    name: 'Case Studies',
    description: 'Real-world implementation examples and success stories',
    icon: FileBadge2,
    technologies: ['Netflix', 'Airbnb', 'Uber', 'Spotify', 'Stripe'],
    color: 'from-teal-500 to-green-500',
    bgColor: 'bg-teal-500/10',
    borderColor: 'border-teal-500/20'
  },
  book: {
    name: 'Books',
    description: 'Technical books, e-books, and reading materials',
    icon: BookOpen,
    technologies: ['O\'Reilly', 'Manning', 'Pragmatic Bookshelf', 'Addison-Wesley'],
    color: 'from-rose-500 to-pink-500',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/20'
  }
};

export default function ForgeCategoryPage() {
  const navigate = useNavigate();
  const { username, categoryId } = useParams();
  const { getToken } = useAuth();
  
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'views'>('latest');
  const [bookmarkedResources, setBookmarkedResources] = useState<string[]>([]);

  const category = categoryInfo[categoryId as keyof typeof categoryInfo];

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true);
        const resourcesData = await getForgeResources({ type: categoryId });
        setResources(resourcesData);
      } catch (err) {
        console.error('Error fetching resources:', err);
        setError('Failed to load resources');
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [categoryId]);

  // Load bookmarked resources
  useEffect(() => {
    const loadBookmarkedResources = async () => {
      try {
        const bookmarked = await getBookmarkedResources(getToken);
        setBookmarkedResources(bookmarked.map((r: any) => r._id));
      } catch (error) {
        console.error('Failed to load bookmarked resources:', error);
      }
    };

    loadBookmarkedResources();
  }, [getToken]);

  const handleBookmark = async (resource: Resource) => {
    try {
      const result = await toggleBookmark(resource._id, getToken);
      
      if (result.isBookmarked) {
        setBookmarkedResources(prev => [...prev, resource._id]);
      } else {
        setBookmarkedResources(prev => prev.filter(id => id !== resource._id));
      }
      
      setResources(prev => prev.map(r => 
        r._id === resource._id 
          ? { ...r, isBookmarked: result.isBookmarked }
          : r
      ));
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    }
  };

  const filteredResources = resources
    .filter(resource => 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (resource.summary || resource.description || '').toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return (b.metrics?.bookmarks || 0) - (a.metrics?.bookmarks || 0);
        case 'views':
          return (b.metrics?.views || 0) - (a.metrics?.views || 0);
        case 'latest':
        default:
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
    });

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-base-content mb-4">Category Not Found</h1>
          <button 
            onClick={() => navigate(`/${username}/forge`)}
            className="text-primary hover:text-primary/80"
          >
            Back to Forge
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-50 to-base-100">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => navigate(`/${username}/forge`)}
            className="flex items-center gap-2 text-base-content/60 hover:text-base-content transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Categories
          </button>
        </div>

        {/* Category Header */}
        <div className={`p-6 rounded-2xl ${category.bgColor} ${category.borderColor} border-2 mb-6`}>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center">
              <category.icon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2 text-base-content">
                {category.name}
              </h1>
              <p className="text-base text-base-content/70">{category.description}</p>
            </div>
          </div>
          
          {/* Technology Icons */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-base-content/60 mb-2">Popular Sources</h3>
            <div className="flex flex-wrap gap-2">
              {category.technologies.map((tech, index) => (
                <div key={index} className="flex items-center gap-1 px-2 py-1 bg-base-100/50 rounded-lg border border-base-300 text-xs">
                  <span className="text-base-content/80 font-medium">{tech}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
            <input
              type="text"
              className="w-full pl-9 pr-9 py-2.5 bg-base-100/80 backdrop-blur-sm border border-base-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-base-content placeholder:text-base-content/60 text-sm"
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-base-content/60 hover:text-error hover:bg-error/10 transition-colors"
                onClick={() => setSearchQuery('')}
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-base-content/40" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2.5 bg-base-100/80 backdrop-blur-sm border border-base-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-base-content text-sm"
            >
              <option value="latest">Latest</option>
              <option value="popular">Most Popular</option>
              <option value="views">Most Viewed</option>
            </select>
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading ? (
            <div className="col-span-full text-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-3"></div>
              <p className="text-base-content/60 dark:text-base-content/50 text-sm">Loading resources...</p>
            </div>
          ) : error ? (
            <div className="col-span-full text-center py-8">
              <p className="text-error text-sm">{error}</p>
            </div>
          ) : filteredResources.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <div className="text-4xl mb-3">📚</div>
              <h3 className="text-lg font-semibold mb-2">No resources found</h3>
              <p className="text-base-content/60 dark:text-base-content/50 mb-3 text-sm">
                {searchQuery ? 'Try adjusting your search terms' : 'No resources available in this category yet'}
              </p>
              <Button 
                variant="outline" 
                onClick={() => navigate(`/${username}/forge`)}
                className="gap-2 text-sm"
                size="sm"
              >
                Back to All Resources
              </Button>
            </div>
          ) : (
            filteredResources.map(resource => (
              <ResourceCard
                key={resource._id}
                resource={{
                  ...resource,
                  isBookmarked: bookmarkedResources.includes(resource._id)
                }}
                onView={resource.url
                  ? async (res: Resource) => {
                      await registerForgeResourceView(res._id, getToken);
                      window.open(res.url, '_blank', 'noopener,noreferrer');
                    }
                  : () => navigate(`/${username}/forge/${resource._id}`)
                }
                onClick={resource.url
                  ? async (res: Resource) => {
                      await registerForgeResourceView(res._id, getToken);
                      window.open(res.url, '_blank', 'noopener,noreferrer');
                    }
                  : () => navigate(`/${username}/forge/${resource._id}`)
                }
                onBookmark={handleBookmark}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
} 