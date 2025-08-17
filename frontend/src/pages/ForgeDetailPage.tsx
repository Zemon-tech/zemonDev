import { useParams } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { ExternalLink } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { getForgeResource, registerForgeResourceView, getForgeProgress, updateForgeProgress, type ForgeProgress } from '../lib/forgeApi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import HtmlContentRenderer from '../components/ui/html-content-renderer';
import { getContentType } from '../lib/content-utils';
import { useForge } from '../context/ForgeContext';

type Resource = {
  _id: string;
  title: string;
  type: string;
  url?: string;
  description: string;
  content?: string; // markdown or HTML string
  contentType?: 'markdown' | 'html'; // New field from backend
  thumbnail?: string; // URL to thumbnail image
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
  const { setCurrentForgeTitle } = useForge();
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState<ForgeProgress | null>(null);
  const timeCounterRef = useRef<number>(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getForgeResource(id)
      .then(setResource)
      .catch(e => setError(e.message || 'Resource not found'))
      .finally(() => setLoading(false));
  }, [id]);

  // Set forge title in context when resource loads
  useEffect(() => {
    if (resource?.title) {
      setCurrentForgeTitle(resource.title);
    }
    
    // Cleanup: clear title when component unmounts
    return () => {
      setCurrentForgeTitle(null);
    };
  }, [resource?.title, setCurrentForgeTitle]);

  // Fetch or create progress
  useEffect(() => {
    if (!id) return;
    let canceled = false;
    (async () => {
      try {
        const p = await getForgeProgress(id, getToken);
        if (!canceled) setProgress(p);
      } catch (e) {
        // ignore if not authenticated or error
      }
    })();
    return () => {
      canceled = true;
    };
  }, [id, getToken]);

  // Register view when content is actually loaded and displayed
  useEffect(() => {
    if (resource && !loading) {
      // Only register view when content is successfully loaded
      registerForgeResourceView(id!, getToken).catch((error: any) => {
        console.warn('Failed to register view:', error);
        // Don't break functionality if view registration fails
      });
    }
  }, [resource, loading, id, getToken]);

  // Track time spent locally and periodically sync
  useEffect(() => {
    if (!id) return;
    // Start counting seconds in view
    intervalRef.current = window.setInterval(() => {
      timeCounterRef.current += 1;
    }, 1000) as unknown as number;

    // Every 15s, push an update if signed in
    const syncInterval = window.setInterval(async () => {
      try {
        const seconds = timeCounterRef.current;
        if (seconds <= 0) return;
        const updated = await updateForgeProgress(id, { status: 'in-progress', timeSpent: (progress?.timeSpent || 0) + seconds }, getToken);
        setProgress(updated);
        timeCounterRef.current = 0; // reset local counter after sync
      } catch {
        // ignore errors (e.g., not authenticated)
      }
    }, 15000);

    // On unmount, flush remaining seconds once
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      window.clearInterval(syncInterval);
      (async () => {
        try {
          const seconds = timeCounterRef.current;
          if (seconds > 0) {
            const updated = await updateForgeProgress(id, { status: 'in-progress', timeSpent: (progress?.timeSpent || 0) + seconds }, getToken);
            setProgress(updated);
            timeCounterRef.current = 0;
          }
        } catch {
          // ignore
        }
      })();
    };
  }, [id, getToken, progress?.timeSpent]);

  if (loading) return <div className="flex items-center justify-center h-full py-16 text-center">Loading...</div>;
  if (error || !resource) return (
    <div className="flex flex-col items-center justify-center h-full py-16 text-center">
      <h1 className="text-3xl font-bold text-error mb-4">{error || 'Resource Not Found'}</h1>
    </div>
  );

  // Determine content type with fallback logic
  const contentType = getContentType(resource.content || '', resource.contentType);

  // Render content based on type
  const renderContent = () => {
    if (!resource.content) {
      return <span className="italic text-base-content/60">No additional content provided.</span>;
    }

    if (contentType === 'html') {
      return (
        <HtmlContentRenderer 
          content={resource.content}
          className="w-full"
          allowScripts={true}
          allowStyles={true}
          renderInIframe={true}
        />
      );
    }

    // Default to markdown with external link handling
    return (
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
          // Handle links to open directly to external sites
          a: ({href, children, ...props}: {href?: string, children: React.ReactNode} & any) => {
            if (href && (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//'))) {
              return (
                <a 
                  href={href} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-primary hover:text-primary-focus underline decoration-primary/30 underline-offset-2 transition-colors inline-flex items-center gap-1"
                  {...props}
                >
                  {children}
                  <ExternalLink className="w-3 h-3" />
                </a>
              );
            }
            // Internal links (if any) can be handled differently
            return (
              <a 
                href={href} 
                className="text-primary hover:text-primary-focus underline decoration-primary/30 underline-offset-2 transition-colors"
                {...props}
              >
                {children}
              </a>
            );
          },
        }}
      >
        {resource.content}
      </ReactMarkdown>
    );
  };

  return (
    <div className="w-full bg-base-100 flex flex-col">
      <div className="w-full">
        {/* External Resource Button */}
        {resource.isExternal && resource.url && (
          <div className="flex justify-end px-4 md:px-8">
            <a href={resource.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-lg h-12 px-6 inline-flex items-center gap-2 shadow-md">
              Visit Resource <ExternalLink className="w-5 h-5" />
            </a>
          </div>
        )}
        
        {/* Summary */}
        <div className="px-4 md:px-8">
          <p className="text-lg text-base-content/70 mb-4">{resource.summary}</p>
        </div>
      </div>
      <div className="w-full flex flex-col">
        {contentType === 'html' ? (
          // Full-width layout for HTML content
          <div className="forge-html-content w-full bg-base-50 -mt-4">
            {renderContent()}
          </div>
        ) : (
          // Standard layout for markdown and other content types
          <div className="prose prose-lg prose-zinc max-w-none w-full bg-base-50 rounded-none p-0 md:p-0 border-0 shadow-none px-4 md:px-8 -mt-4"
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
            {renderContent()}
          </div>
        )}
        <div className="mt-4 px-4 md:px-8 pb-6">
          {/* Compact Single-Line Footer */}
          <div className="bg-gradient-to-r from-base-200/40 to-base-300/40 backdrop-blur-sm border border-base-300/50 rounded-lg px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              {/* Left Side - Author, Date, Views */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-base-content/70">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  <span className="font-medium">Author:</span>
                  <span className="text-base-content">{resource.createdBy?.fullName || 'ZEMON'}</span>
                </div>
                <div className="w-px h-3 bg-base-300/50"></div>
                <div className="flex items-center gap-2 text-sm text-base-content/70">
                  <div className="w-1.5 h-1.5 bg-secondary rounded-full"></div>
                  <span className="font-medium">Created:</span>
                  <span className="text-base-content">
                    {resource.createdAt ? new Date(resource.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    }) : ''}
                  </span>
                </div>
                <div className="w-px h-3 bg-base-300/50"></div>
                <div className="flex items-center gap-2 text-sm text-base-content/70">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                  <span className="font-medium">{resource.metrics?.views ?? 0} views</span>
                </div>
              </div>
              
              {/* Right Side - Categories and Tags */}
              <div className="flex items-center gap-3">
                {/* Category Badge */}
                <div className="flex items-center gap-1.5 px-2 py-1 bg-primary/10 border border-primary/20 rounded-md">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  <span className="text-xs font-semibold text-primary capitalize">
                    {resource.type.replace('_', ' ')}
                  </span>
                </div>
                
                {/* Content Type Badge */}
                <div className="flex items-center gap-1.5 px-2 py-1 bg-secondary/10 border border-secondary/20 rounded-md">
                  <div className="w-1.5 h-1.5 bg-secondary rounded-full"></div>
                  <span className="text-xs font-semibold text-secondary capitalize">
                    {contentType}
                  </span>
                </div>
                
                {/* Tags */}
                <div className="flex items-center gap-1.5">
                  {resource.tags.slice(0, 2).map((tag: string) => (
                    <span key={tag} className="px-2 py-1 bg-base-100/80 border border-base-300/40 rounded-md text-xs font-medium text-base-content/70 hover:text-base-content transition-colors">
                      #{tag}
                    </span>
                  ))}
                  {resource.tags.length > 2 && (
                    <span className="px-2 py-1 bg-base-100/80 border border-base-300/40 rounded-md text-xs font-medium text-base-content/50">
                      +{resource.tags.length - 2}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 