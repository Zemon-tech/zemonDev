import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Search, X} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { getForgeResources, registerForgeResourceView, toggleBookmark, getBookmarkedResources } from '../lib/forgeApi';
import { ResourceCard } from '@/components/blocks/ResourceCard';
import type { Resource } from '@/components/blocks/ResourceCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRef } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';



export default function ForgePage() {
  const { getToken } = useAuth();
  const [search, setSearch] = useState('');
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      {/* Search Bar */}
      <div className="relative w-full max-w-md mx-auto mb-4">
        <Input
          ref={searchInputRef}
          type="text"
          className="rounded-full pl-10 pr-8 py-2 text-sm bg-base-100 border border-base-300 shadow-sm focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200 text-base-content placeholder:text-base-content/60 w-full"
          placeholder="Search resources..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          aria-label="Search resources"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/60 pointer-events-none">
          <Search className="w-4 h-4" />
        </span>
        {search && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-base-content/60 hover:text-error hover:bg-error/10 transition-colors"
            tabIndex={0}
            aria-label="Clear search"
            onClick={() => {
              setSearch('');
              searchInputRef.current?.focus();
            }}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
      {/* Category Filter Bar */}
      <div className="mb-4 border-b border-base-300 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <Badge
            key="all"
            variant={selectedType === '' ? 'default' : 'outline'}
            className={cn(
              'px-3 py-1 rounded-full cursor-pointer text-xs capitalize transition-all hover:scale-105',
              selectedType === '' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent bg-base-200 text-base-content border-none'
            )}
            onClick={() => setSelectedType('')}
          >
            All
          </Badge>
          {allTypes.map(type => (
            <Badge
              key={type}
              variant={selectedType === type ? 'default' : 'outline'}
              className={cn(
                'px-3 py-1 rounded-full cursor-pointer text-xs capitalize transition-all hover:scale-105',
                selectedType === type ? 'bg-primary text-primary-foreground' : 'hover:bg-accent bg-base-200 text-base-content border-none'
              )}
              onClick={() => setSelectedType(type)}
            >
              {type.replace('_', ' ')}
            </Badge>
          ))}
        </div>
      </div>
      {/* Resource Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-1">
        {loading ? (
          <div className="col-span-full text-center text-base-content/60 py-12">Loading...</div>
        ) : error ? (
          <div className="col-span-full text-center text-base-content/60 py-12">{error}</div>
        ) : filtered
          .filter(r => selectedType === '' || r.type === selectedType)
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
          <div className="col-span-full text-center text-base-content/60 py-12">No resources found.</div>
        )}
      </div>
    </div>
  );
} 