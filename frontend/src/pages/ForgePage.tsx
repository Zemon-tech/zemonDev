import { useEffect, useState } from 'react';
import { Search, ExternalLink, BookOpen, FileText, Film, Wrench, FolderGit2, FileBadge2 } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getForgeResources, registerForgeResourceView } from '../lib/forgeApi';

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

type Resource = {
  _id: string;
  title: string;
  type: string;
  url: string;
  description: string;
  content?: string;
  tags: string[];
  difficulty?: string;
  createdBy?: any;
  metrics?: { views?: number };
  createdAt?: string;
  summary?: string;
};

export default function ForgePage() {
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const { username } = useParams();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        {/* Search Bar (left) */}
        <div className="relative w-full max-w-xs flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/60">
            <Search className="w-5 h-5" />
          </span>
          <input
            type="text"
            className="input input-bordered input-md w-full pl-10 pr-10"
            placeholder="Search resources..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-ghost btn-xs rounded-full" tabIndex={-1}>
            <Search className="w-5 h-5 text-primary" />
          </button>
        </div>
        {/* Type Filter Toggle Group (right) */}
        <div className="flex justify-end">
          <div className="join">
            {typeOptions.map(opt => (
              <button
                key={opt.value}
                className={`btn btn-sm join-item capitalize transition-all duration-200 ${type === opt.value ? 'btn-active btn-primary' : 'btn-ghost'}`}
                onClick={() => setType(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* Resource Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-2">
        {loading ? (
          <div className="col-span-full text-center text-base-content/60 py-12">Loading...</div>
        ) : error ? (
          <div className="col-span-full text-center text-base-content/60 py-12">{error}</div>
        ) : filtered.map(resource => (
          resource.url ? (
            <div
              key={resource._id}
              className="card card-normal bg-base-100 border border-base-200 shadow transition-all duration-200 hover:shadow-lg hover:scale-[1.01] cursor-pointer flex flex-col group overflow-hidden no-underline hover:no-underline"
              style={{ minHeight: 240, textDecoration: 'none' }}
            >
              <div className="card-body flex-1 flex flex-col gap-2">
                <div className="flex items-center gap-2 mb-1">
                  {typeIconMap[resource.type]}
                  <span className="badge badge-outline badge-primary badge-sm capitalize">{resource.type.replace('_', ' ')}</span>
                </div>
                <h2 className="card-title font-heading text-lg font-bold leading-tight line-clamp-2">
                  {resource.title}
                </h2>
                <p className="text-base-content/70 text-sm line-clamp-3 mb-1">
                  {(resource.summary || resource.description || '').length > 200 ? (resource.summary || resource.description || '').slice(0, 200) + '…' : (resource.summary || resource.description || '')}
                </p>
                <div className="flex flex-wrap gap-1 mt-auto">
                  {resource.tags.map((tag: string) => (
                    <span key={tag} className="badge badge-ghost badge-xs rounded capitalize">{tag}</span>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between px-4 pb-3">
                <span className="text-xs text-base-content/50">{resource.metrics?.views ?? 0} views</span>
                <button
                  className="inline-flex items-center gap-1 text-primary text-xs font-medium group-hover:underline bg-transparent border-none outline-none cursor-pointer"
                  onClick={async (e) => {
                    e.stopPropagation();
                    await registerForgeResourceView(resource._id);
                    window.open(resource.url, '_blank', 'noopener,noreferrer');
                  }}
                >
                  View <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div
              key={resource._id}
              className="card card-normal bg-base-100 border border-base-200 shadow transition-all duration-200 hover:shadow-lg hover:scale-[1.01] cursor-pointer flex flex-col group overflow-hidden no-underline hover:no-underline"
              style={{ minHeight: 240, textDecoration: 'none' }}
            >
              <div className="card-body flex-1 flex flex-col gap-2">
                <div className="flex items-center gap-2 mb-1">
                  {typeIconMap[resource.type]}
                  <span className="badge badge-outline badge-primary badge-sm capitalize">{resource.type.replace('_', ' ')}</span>
                </div>
                <h2 className="card-title font-heading text-lg font-bold leading-tight line-clamp-2">
                  {resource.title}
                </h2>
                <p className="text-base-content/70 text-sm line-clamp-3 mb-1">
                  {(resource.summary || resource.description || '').length > 200 ? (resource.summary || resource.description || '').slice(0, 200) + '…' : (resource.summary || resource.description || '')}
                </p>
                <div className="flex flex-wrap gap-1 mt-auto">
                  {resource.tags.map((tag: string) => (
                    <span key={tag} className="badge badge-ghost badge-xs rounded capitalize">{tag}</span>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between px-4 pb-3">
                <span className="text-xs text-base-content/50">{resource.metrics?.views ?? 0} views</span>
                <button
                  className="inline-flex items-center gap-1 text-primary text-xs font-medium group-hover:underline bg-transparent border-none outline-none cursor-pointer"
                  onClick={async (e) => {
                    e.stopPropagation();
                    await registerForgeResourceView(resource._id);
                    navigate(`/${username}/forge/${resource._id}`);
                  }}
                >
                  View Details
                </button>
              </div>
            </div>
          )
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center text-base-content/60 py-12">No resources found.</div>
        )}
      </div>
    </div>
  );
} 