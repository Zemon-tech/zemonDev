import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Search, ExternalLink, BookOpen, FileText, Film, Wrench, FolderGit2, FileBadge2, X, Sparkles } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getForgeResources, registerForgeResourceView } from '../lib/forgeApi';
import { ResourceCard } from '@/components/blocks/ResourceCard';
import type { Resource } from '@/components/blocks/ResourceCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRef } from 'react';
import { cn } from '@/lib/utils';

const typeOptions = [
  { label: 'All', value: '' },
  { label: 'Article', value: 'article' },
  { label: 'Case Study', value: 'case_study' },
  { label: 'Documentation', value: 'documentation' },
  { label: 'Tool', value: 'tool' },
  { label: 'Video', value: 'video' },
];

// Map resource type to icon
const typeIconMap: Record<string, React.ReactNode> = {
  article: <FileText className="w-4 h-4 text-primary" />, // Article
  documentation: <BookOpen className="w-4 h-4 text-primary" />, // Documentation
  case_study: <FileBadge2 className="w-4 h-4 text-primary" />, // Case Study
  tool: <Wrench className="w-4 h-4 text-primary" />, // Tool
  video: <Film className="w-4 h-4 text-primary" />, // Video
  repository: <FolderGit2 className="w-4 h-4 text-primary" />, // Repository
};

export default function ForgePage() {
  const { getToken } = useAuth();
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const { username } = useParams();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLoading(true);
    getForgeResources({ type })
      .then(setResources)
      .catch(e => setError(e.message || 'Failed to load resources'))
      .finally(() => setLoading(false));
  }, [type]);

  const filtered = resources.filter(r =>
    (type === '' || r.type === type) &&
    (r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.tags.some((tag: string) => tag.toLowerCase().includes(search.toLowerCase())) ||
      (r.summary || r.description || '').toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      {/* Search and Type Filter Row */}
      <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
        {/* Search Bar (left) */}
        <div className="relative w-full max-w-xs flex-1">
          <Input
            ref={searchInputRef}
            type="text"
            className="rounded-full pl-10 pr-8 py-2 text-sm bg-base-100 border border-base-300 shadow-sm focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200 text-base-content placeholder:text-base-content/60"
            placeholder="Search resources..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search resources"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/60 pointer-events-none">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
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
        {/* Type Filter Toggle Group (right) */}
        <div className="flex justify-end">
          <div className="join">
            {typeOptions.map(opt => (
              <button
                key={opt.value}
                className={cn(
                  'btn btn-xs join-item capitalize rounded-full px-4 py-1 font-semibold transition-all duration-150',
                  type === opt.value ? 'btn-active btn-primary' : 'btn-ghost text-base-content/60 hover:bg-accent/20 hover:text-primary',
                  'focus-visible:ring-2 focus-visible:ring-primary/40',
                )}
                onClick={() => setType(opt.value)}
                aria-pressed={type === opt.value}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* Resource Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-1">
        {loading ? (
          <div className="col-span-full text-center text-base-content/60 py-12">Loading...</div>
        ) : error ? (
          <div className="col-span-full text-center text-base-content/60 py-12">{error}</div>
        ) : filtered.map(resource => (
          <ResourceCard
            key={resource._id}
            resource={resource}
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
          />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center text-base-content/60 py-12">No resources found.</div>
        )}
      </div>
    </div>
  );
} 