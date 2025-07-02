import { useState } from 'react';
import { Search, ExternalLink } from 'lucide-react';

// Dummy data for demonstration
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

const typeOptions = [
  { label: 'All', value: '' },
  { label: 'Article', value: 'article' },
  { label: 'Case Study', value: 'case_study' },
  { label: 'Documentation', value: 'documentation' },
  { label: 'Tool', value: 'tool' },
  { label: 'Video', value: 'video' },
];

export default function ForgePage() {
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');

  const filtered = resources.filter(r =>
    (type === '' || r.type === type) &&
    (r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase())) ||
      r.summary?.toLowerCase().includes(search.toLowerCase()))
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
            className="input input-bordered input-md w-full pl-10"
            placeholder="Search resources..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
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
        {filtered.map(resource => (
          <a
            key={resource._id}
            href={resource.url || '#'}
            target={resource.url ? '_blank' : undefined}
            rel="noopener noreferrer"
            className="card card-normal bg-base-100 border border-base-200 shadow transition-all duration-200 hover:shadow-lg hover:scale-[1.01] cursor-pointer flex flex-col group overflow-hidden"
            style={{ minHeight: 240 }}
          >
            <div className="card-body flex-1 flex flex-col gap-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="badge badge-outline badge-primary badge-sm capitalize">{resource.type.replace('_', ' ')}</span>
              </div>
              <h2 className="card-title font-heading text-lg font-bold leading-tight line-clamp-2">
                {resource.title}
              </h2>
              <p className="text-base-content/70 text-sm line-clamp-3 mb-1">
                {resource.summary.length > 200 ? resource.summary.slice(0, 200) + '…' : resource.summary}
              </p>
              <div className="flex flex-wrap gap-1 mt-auto">
                {resource.tags.map(tag => (
                  <span key={tag} className="badge badge-ghost badge-xs rounded capitalize">{tag}</span>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between px-4 pb-3">
              <span className="text-xs text-base-content/50">{resource.viewCount} views</span>
              {resource.url && (
                <span className="inline-flex items-center gap-1 text-primary text-xs font-medium group-hover:underline">
                  View <ExternalLink className="w-4 h-4" />
                </span>
              )}
              {!resource.url && (
                <span className="inline-flex items-center gap-1 text-primary text-xs font-medium group-hover:underline">
                  View Details
                </span>
              )}
            </div>
          </a>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center text-base-content/60 py-12">No resources found.</div>
        )}
      </div>
    </div>
  );
} 