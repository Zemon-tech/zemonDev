import { useParams, Link } from 'react-router-dom';
import { ExternalLink, ArrowLeft } from 'lucide-react';

// Dummy data (should be shared or imported in real app)
const resources = [
  {
    _id: '1',
    title: 'Kafka for Beginners',
    type: 'article',
    url: '',
    content: 'A beginner-friendly guide to Kafka concepts and setup.',
    tags: ['kafka', 'messaging', 'beginner'],
    authorId: 'user1',
    viewCount: 120,
    createdAt: new Date(),
    summary: 'A ZEMON-created guide for getting started with Kafka.'
  },
  {
    _id: '2',
    title: 'Official Kafka Documentation',
    type: 'documentation',
    url: 'https://kafka.apache.org/documentation/',
    content: '',
    tags: ['kafka', 'docs'],
    authorId: '',
    viewCount: 300,
    createdAt: new Date(),
    summary: 'The official documentation for Apache Kafka.'
  },
  {
    _id: '3',
    title: 'How LinkedIn uses Kafka',
    type: 'case_study',
    url: '',
    content: 'A case study on how LinkedIn leverages Kafka for large-scale messaging.',
    tags: ['kafka', 'case study', 'linkedin'],
    authorId: 'user2',
    viewCount: 80,
    createdAt: new Date(),
    summary: 'A real-world case study from LinkedIn.'
  },
  {
    _id: '4',
    title: 'Kafka Producer-Consumer Code Snippets',
    type: 'tool',
    url: '',
    content: 'Code snippets for a basic Kafka producer and consumer setup.',
    tags: ['kafka', 'code', 'snippets'],
    authorId: 'user3',
    viewCount: 60,
    createdAt: new Date(),
    summary: 'Quick code snippets for Kafka.'
  },
];

export default function ForgeDetailPage() {
  const { id } = useParams();
  const resource = resources.find(r => r._id === id);

  if (!resource) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16 text-center">
        <h1 className="text-3xl font-bold text-error mb-4">Resource Not Found</h1>
        <Link to="../forge" className="btn btn-primary"><ArrowLeft className="mr-2" />Back to Forge</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="../forge" className="btn btn-ghost mb-4"><ArrowLeft className="mr-2" />Back to Forge</Link>
      <div className="card bg-base-100 border border-base-200 shadow-xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="badge badge-outline badge-primary badge-sm capitalize">{resource.type.replace('_', ' ')}</span>
          <span className="text-xs text-base-content/50 ml-auto">{resource.viewCount} views</span>
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
            {resource.tags.map(tag => (
              <span key={tag} className="badge badge-ghost badge-xs rounded capitalize">{tag}</span>
            ))}
          </div>
        </div>
        <div className="prose max-w-none text-base-content">
          {resource.content || <span className="italic text-base-content/60">No additional content provided.</span>}
        </div>
        <div className="mt-6 text-xs text-base-content/60">
          <span>Author: {resource.authorId || 'ZEMON'}</span>
          <span className="mx-2">|</span>
          <span>Created: {resource.createdAt instanceof Date ? resource.createdAt.toLocaleDateString() : resource.createdAt}</span>
        </div>
      </div>
    </div>
  );
} 