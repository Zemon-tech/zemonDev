import { useParams, Link } from 'react-router-dom';
import { ExternalLink, ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { registerForgeResourceView } from '../lib/forgeApi';

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

export default function ForgeDetailPage() {
  const { id } = useParams();
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    registerForgeResourceView(id)
      .then(setResource)
      .catch(e => setError(e.message || 'Resource not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex items-center justify-center h-full py-16 text-center">Loading...</div>;
  if (error || !resource) return (
    <div className="flex flex-col items-center justify-center h-full py-16 text-center">
      <h1 className="text-3xl font-bold text-error mb-4">{error || 'Resource Not Found'}</h1>
      <Link to="../forge" className="btn btn-primary"><ArrowLeft className="mr-2" />Back to Forge</Link>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="../forge" className="btn btn-ghost mb-4"><ArrowLeft className="mr-2" />Back to Forge</Link>
      <div className="card bg-base-100 border border-base-200 shadow-xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="badge badge-outline badge-primary badge-sm capitalize">{resource.type.replace('_', ' ')}</span>
          <span className="text-xs text-base-content/50 ml-auto">{resource.metrics?.views ?? 0} views</span>
        </div>
        <h1 className="text-3xl font-bold font-heading mb-2">{resource.title}</h1>
        <p className="text-base-content/70 mb-4">{resource.summary}</p>
        {resource.url && (
          <a href={resource.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm mb-4 inline-flex items-center gap-1">
            Visit Resource <ExternalLink className="w-4 h-4" />
          </a>
        )}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {resource.tags.map((tag: string) => (
              <span key={tag} className="badge badge-ghost badge-xs rounded capitalize">{tag}</span>
            ))}
          </div>
        </div>
        <div className="prose max-w-none text-base-content">
          {resource.content || <span className="italic text-base-content/60">No additional content provided.</span>}
        </div>
        <div className="mt-6 text-xs text-base-content/60">
          <span>Author: {resource.createdBy?.fullName || 'ZEMON'}</span>
          <span className="mx-2">|</span>
          <span>Created: {resource.createdAt ? new Date(resource.createdAt).toLocaleDateString() : ''}</span>
        </div>
      </div>
    </div>
  );
} 