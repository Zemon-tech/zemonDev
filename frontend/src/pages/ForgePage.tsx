import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { BookOpen, FileText, Film, Wrench, FolderGit2, FileBadge2,Eye, Filter } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { getForgeResources, registerForgeResourceView, toggleBookmark, getBookmarkedResources } from '../lib/forgeApi';
import { ResourceCard } from '@/components/blocks/ResourceCard';
import type { Resource } from '@/components/blocks/ResourceCard';
import { Button } from '@/components/ui/button';
import { useRef } from 'react';




export default function ForgePage() {
  const { getToken } = useAuth();
  const [search] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const { username } = useParams();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookmarkedResources, setBookmarkedResources] = useState<string[]>([]);
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLoading(true);
    getForgeResources({ type: selectedType })
      .then(setResources)
      .catch(e => setError(e.message || 'Failed to load resources'))
      .finally(() => setLoading(false));
  }, [selectedType]);

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

  const filtered = resources.filter(r =>
    (selectedType === '' || r.type === selectedType) &&
    (r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.tags.some((tag: string) => tag.toLowerCase().includes(search.toLowerCase())) ||
      (r.summary || r.description || '').toLowerCase().includes(search.toLowerCase()))
  );

  // Collect all unique types from resources for scalable categories
  const allTypes = Array.from(new Set(resources.map(r => r.type))).sort();

  // Handle bookmark toggle
  const handleBookmark = async (resource: Resource) => {
    try {
      const result = await toggleBookmark(resource._id, getToken);
      
      // Update local state
      if (result.isBookmarked) {
        setBookmarkedResources(prev => [...prev, resource._id]);
      } else {
        setBookmarkedResources(prev => prev.filter(id => id !== resource._id));
      }
      
      // Update resource in the list
      setResources(prev => prev.map(r => 
        r._id === resource._id 
          ? { ...r, isBookmarked: result.isBookmarked }
          : r
      ));
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    }
  };

  // Category definitions with icons and colors
  const categories = [
    { 
      id: 'course', 
      name: 'Courses', 
      description: 'Structured learning paths and tutorials', 
      icon: BookOpen, 
      color: 'from-blue-500 to-cyan-500', 
      bgColor: 'bg-gradient-to-br from-blue-500/5 to-cyan-500/5 dark:from-blue-500/10 dark:to-cyan-500/10', 
      borderColor: 'border-blue-500/20 dark:border-blue-500/30',
      hoverColor: 'hover:from-blue-500/10 hover:to-cyan-500/10 dark:hover:from-blue-500/20 dark:hover:to-cyan-500/20'
    },
    { 
      id: 'repository', 
      name: 'Repositories', 
      description: 'Open source projects and code examples', 
      icon: FolderGit2, 
      color: 'from-green-500 to-emerald-500', 
      bgColor: 'bg-gradient-to-br from-green-500/5 to-emerald-500/5 dark:from-green-500/10 dark:to-emerald-500/10', 
      borderColor: 'border-green-500/20 dark:border-green-500/30',
      hoverColor: 'hover:from-green-500/10 hover:to-emerald-500/10 dark:hover:from-green-500/20 dark:hover:to-emerald-500/20'
    },
    { 
      id: 'article', 
      name: 'Articles', 
      description: 'In-depth technical articles and guides', 
      icon: FileText, 
      color: 'from-purple-500 to-pink-500', 
      bgColor: 'bg-gradient-to-br from-purple-500/5 to-pink-500/5 dark:from-purple-500/10 dark:to-pink-500/10', 
      borderColor: 'border-purple-500/20 dark:border-purple-500/30',
      hoverColor: 'hover:from-purple-500/10 hover:to-pink-500/10 dark:hover:from-purple-500/20 dark:hover:to-pink-500/20'
    },
    { 
      id: 'documentation', 
      name: 'Documentation', 
      description: 'Official docs and technical references', 
      icon: BookOpen, 
      color: 'from-orange-500 to-red-500', 
      bgColor: 'bg-gradient-to-br from-orange-500/5 to-red-500/5 dark:from-orange-500/10 dark:to-red-500/10', 
      borderColor: 'border-orange-500/20 dark:border-orange-500/30',
      hoverColor: 'hover:from-orange-500/10 hover:to-red-500/10 dark:hover:from-orange-500/20 dark:hover:to-red-500/20'
    },
    { 
      id: 'video', 
      name: 'Videos', 
      description: 'Video tutorials and presentations', 
      icon: Film, 
      color: 'from-indigo-500 to-blue-500', 
      bgColor: 'bg-gradient-to-br from-indigo-500/5 to-blue-500/5 dark:from-indigo-500/10 dark:to-blue-500/10', 
      borderColor: 'border-indigo-500/20 dark:border-indigo-500/30',
      hoverColor: 'hover:from-indigo-500/10 hover:to-blue-500/10 dark:hover:from-indigo-500/20 dark:hover:to-blue-500/20'
    },
    { 
      id: 'tool', 
      name: 'Tools', 
      description: 'Development tools and utilities', 
      icon: Wrench, 
      color: 'from-yellow-500 to-orange-500', 
      bgColor: 'bg-gradient-to-br from-yellow-500/5 to-orange-500/5 dark:from-yellow-500/10 dark:to-orange-500/10', 
      borderColor: 'border-yellow-500/20 dark:border-yellow-500/30',
      hoverColor: 'hover:from-yellow-500/10 hover:to-orange-500/10 dark:hover:from-yellow-500/20 dark:hover:to-orange-500/20'
    },
    { 
      id: 'case_study', 
      name: 'Case Studies', 
      description: 'Real-world implementation examples', 
      icon: FileBadge2, 
      color: 'from-teal-500 to-green-500', 
      bgColor: 'bg-gradient-to-br from-teal-500/5 to-green-500/5 dark:from-teal-500/10 dark:to-green-500/10', 
      borderColor: 'border-teal-500/20 dark:border-teal-500/30',
      hoverColor: 'hover:from-teal-500/10 hover:to-green-500/10 dark:hover:from-teal-500/20 dark:hover:to-green-500/20'
    },
    { 
      id: 'book', 
      name: 'Books', 
      description: 'Technical books and reading materials', 
      icon: BookOpen, 
      color: 'from-rose-500 to-pink-500', 
      bgColor: 'bg-gradient-to-br from-rose-500/5 to-pink-500/5 dark:from-rose-500/10 dark:to-pink-500/10', 
      borderColor: 'border-rose-500/20 dark:border-rose-500/30',
      hoverColor: 'hover:from-rose-500/10 hover:to-pink-500/10 dark:hover:from-rose-500/20 dark:hover:to-pink-500/20'
    }
  ];

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/${username}/forge/category/${categoryId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-50 to-base-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-base-100/80 backdrop-blur-sm border border-base-300 rounded-full text-xs text-base-content/70 mb-2">
                <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse"></span>
                Discover 1000+ curated resources
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              The Forge
            </h1>
            <p className="text-lg md:text-xl text-base-content/80 mb-6 max-w-2xl mx-auto leading-relaxed">
              Your curated collection of learning resources, tools, and knowledge to accelerate your development journey.
            </p>

            {/* Stats */}
            <div className="flex justify-center gap-8 mb-6">
              <div className="text-center group">
                <div className="text-2xl font-bold text-primary mb-1 group-hover:scale-110 transition-transform">
                  {resources.length}
                </div>
                <div className="text-sm text-base-content/70">Resources</div>
              </div>
              <div className="text-center group">
                <div className="text-2xl font-bold text-primary mb-1 group-hover:scale-110 transition-transform">
                  {resources.reduce((sum, r) => sum + (r.metrics?.views || 0), 0)}
                </div>
                <div className="text-sm text-base-content/70">Total Views</div>
              </div>
              <div className="text-center group">
                <div className="text-2xl font-bold text-primary mb-1 group-hover:scale-110 transition-transform">
                  {bookmarkedResources.length}
                </div>
                <div className="text-sm text-base-content/70">Bookmarked</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-base-content mb-4">Explore by Category</h2>
          <p className="text-base-content/60 text-lg">Find the perfect resources for your learning journey</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-12">
          {categories.map((category) => {
            const IconComponent = category.icon;
            const categoryCount = resources.filter(r => r.type === category.id).length;
            
            return (
              <div key={category.id} onClick={() => handleCategoryClick(category.id)}>
                <div className={`group cursor-pointer rounded-xl border transition-all duration-300 ${category.bgColor} ${category.borderColor} ${category.hoverColor} hover:shadow-lg hover:shadow-primary/10 dark:hover:shadow-primary/20 hover:-translate-y-1`}>
                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-base-content group-hover:text-primary transition-colors">{category.name}</h3>
                        <p className="text-xs text-base-content/60 dark:text-base-content/50">{categoryCount} resources</p>
                      </div>
                      <div className="w-2 h-2 bg-primary rounded-full group-hover:scale-150 transition-transform opacity-60"></div>
                    </div>
                    <p className="text-sm text-base-content/70 dark:text-base-content/60 leading-relaxed line-clamp-2">{category.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Resources Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-base-content">Recent Resources</h3>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-base-content/40" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-1 bg-base-100 border border-base-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-base-content text-sm"
              >
                <option value="">All Types</option>
                {allTypes.map(type => (
                  <option key={type} value={type}>{type.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-base-content/60">Loading resources...</p>
              </div>
            ) : error ? (
              <div className="col-span-full text-center py-12">
                <p className="text-error">{error}</p>
              </div>
            ) : filtered
              .filter(r => selectedType === '' || r.type === selectedType)
              .slice(0, 8)
              .map(resource => (
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
              ))}
            {filtered.filter(r => selectedType === '' || r.type === selectedType).length === 0 && (
              <div className="col-span-full text-center py-12">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-xl font-semibold mb-2">No resources found</h3>
                <p className="text-base-content/60">Try adjusting your filters or search terms</p>
              </div>
            )}
          </div>

          {filtered.filter(r => selectedType === '' || r.type === selectedType).length > 8 && (
            <div className="text-center mt-8">
              <Button 
                variant="outline" 
                onClick={() => navigate(`/${username}/forge/category/all`)}
                className="gap-2"
              >
                View All Resources
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 