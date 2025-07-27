import { useParams } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';
import { registerForgeResourceView } from '../lib/forgeApi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Resource = {
  _id: string;
  title: string;
  type: string;
  url?: string;
  description: string;
  content?: string; // markdown string
  tags: string[];
  difficulty?: string;
  createdBy?: any;
  metrics?: { views?: number };
  createdAt?: string;
  summary?: string;
  isExternal?: boolean;
};

export default function ForgeDetailPage() {
  const { id } = useParams();
  const { getToken } = useAuth();
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    registerForgeResourceView(id, getToken)
      .then(setResource)
      .catch(e => setError(e.message || 'Resource not found'))
      .finally(() => setLoading(false));
  }, [id, getToken]);

  if (loading) return <div className="flex items-center justify-center h-full py-16 text-center">Loading...</div>;
  if (error || !resource) return (
    <div className="flex flex-col items-center justify-center h-full py-16 text-center">
      <h1 className="text-3xl font-bold text-error mb-4">{error || 'Resource Not Found'}</h1>
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-base-100 flex flex-col">
      <div className="w-full">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 pt-8 px-0 md:px-0">
          <h1 className="text-4xl md:text-5xl font-bold font-heading text-primary leading-tight mb-2 md:mb-0 px-4 md:px-8">
            {resource.title}
          </h1>
          {resource.isExternal && resource.url && (
            <a href={resource.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-lg h-12 px-6 inline-flex items-center gap-2 shadow-md mx-4 md:mx-8">
              Visit Resource <ExternalLink className="w-5 h-5" />
            </a>
          )}
        </div>
        <div className="flex flex-wrap gap-2 mt-4 mb-2 px-4 md:px-8">
          <span className="badge badge-outline badge-primary badge-sm capitalize">{resource.type.replace('_', ' ')}</span>
          <span className="text-xs text-base-content/50">{resource.metrics?.views ?? 0} views</span>
            {resource.tags.map((tag: string) => (
            <span key={tag} className="badge badge-ghost badge-md rounded capitalize text-base font-medium px-3 py-1">{tag}</span>
            ))}
        </div>
        <p className="text-lg text-base-content/70 mb-2 px-4 md:px-8">{resource.summary}</p>
      </div>
      <div className="flex-1 w-full flex flex-col">
        <div className="prose prose-lg prose-zinc max-w-none w-full bg-base-50/80 rounded-none p-0 md:p-0 border-0 shadow-none px-4 md:px-8"
          style={{
            '--tw-prose-headings': '#1e293b',
            '--tw-prose-h1': '2.8rem',
            '--tw-prose-h2': '2.2rem',
            '--tw-prose-h3': '1.6rem',
            '--tw-prose-code': '1.1em',
            '--tw-prose-pre-bg': '#f3f4f6',
            '--tw-prose-pre': '1.1em',
            fontSize: '1.25rem',
            lineHeight: '2.1rem',
          } as React.CSSProperties}
        >
          {!resource.isExternal && resource.content ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({...props}) => <h1 className="text-5xl font-extrabold mt-8 mb-4 text-primary" {...props} />,
                h2: ({...props}) => <h2 className="text-3xl font-bold mt-8 mb-3 text-primary/90" {...props} />,
                h3: ({...props}) => <h3 className="text-2xl font-semibold mt-6 mb-2 text-primary/80" {...props} />,
                code: ({inline, className, children, ...props}: {inline?: boolean, className?: string, children: React.ReactNode} & any) =>
                  inline ? (
                    <code className="bg-base-200 text-base-content px-2 py-1 rounded text-lg font-mono" {...props}>{children}</code>
                  ) : (
                    <pre className="bg-base-200 text-base-content p-4 rounded-lg overflow-x-auto text-lg font-mono my-4" {...props}>
                      <code>{children}</code>
                    </pre>
                  ),
                // Optionally, you can add more custom renderers for icons, blockquotes, etc.
              }}
            >
              {resource.content}
            </ReactMarkdown>
          ) : (
            <span className="italic text-base-content/60">No additional content provided.</span>
          )}
        </div>
        <div className="mt-6 text-sm text-base-content/60 flex flex-wrap gap-4 items-center px-4 md:px-8 pb-8">
          <span>Author: {resource.createdBy?.fullName || 'ZEMON'}</span>
          <span>|</span>
          <span>Created: {resource.createdAt ? new Date(resource.createdAt).toLocaleDateString() : ''}</span>
        </div>
      </div>
    </div>
  );
} 