import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, ExternalLink, BookOpen, FileText, Film, Wrench, FolderGit2, FileBadge2, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';

const typeIconMap: Record<string, React.ReactNode> = {
  article: <FileText className="w-4 h-4 text-primary" />, // Article
  documentation: <BookOpen className="w-4 h-4 text-primary" />, // Documentation
  case_study: <FileBadge2 className="w-4 h-4 text-primary" />, // Case Study
  tool: <Wrench className="w-4 h-4 text-primary" />, // Tool
  video: <Film className="w-4 h-4 text-primary" />, // Video
  repository: <FolderGit2 className="w-4 h-4 text-primary" />, // Repository
  course: <BookOpen className="w-4 h-4 text-primary" />, // Course
  book: <BookOpen className="w-4 h-4 text-primary" />, // Book
};

export type Resource = {
  _id: string;
  title: string;
  type: string;
  url: string;
  description: string;
  content?: string;
  tags: string[];
  difficulty?: string;
  createdBy?: any;
  metrics?: { views?: number; bookmarks?: number };
  createdAt?: string;
  summary?: string;
  isBookmarked?: boolean;
};

type ResourceCardProps = {
  resource: Resource;
  onView?: (resource: Resource) => void;
  onClick?: (resource: Resource) => void;
  onBookmark?: (resource: Resource) => void;
  className?: string;
};

export const ResourceCard: React.FC<ResourceCardProps> = ({ resource, onView, onClick, onBookmark, className }) => {
  const MAX_TAGS = 5;
  const visibleTags = resource.tags.slice(0, MAX_TAGS);
  const extraTags = resource.tags.length > MAX_TAGS ? resource.tags.slice(MAX_TAGS) : [];

  return (
    <Card
      className={cn(
        // Card size and style
        'relative flex flex-col justify-between h-full min-h-[240px] max-h-[340px] bg-card text-card-foreground border border-base-200 shadow-lg rounded-xl overflow-hidden transition-all duration-200',
        'hover:shadow-xl hover:scale-[1.01] cursor-pointer',
        'p-0',
        className
      )}
      style={{
        // Ensure fixed card dimensions
        minHeight: 240,
        maxHeight: 340,
      }}
      onClick={() => onClick?.(resource)}
    >
      <CardHeader className="pb-2 pt-4 px-5 flex flex-row items-center gap-2 border-none bg-transparent">
        {/* Type Icon & Category Label */}
        <div className="flex items-center gap-2">
          {typeIconMap[resource.type]}
          <Badge
            variant="outline"
            className="rounded-full px-3 py-1 text-xs font-semibold bg-base-200 text-base-content border-none shadow-none capitalize tracking-wide"
            style={{ letterSpacing: '0.01em' }}
          >
            {resource.type.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-2 px-5 pb-2 pt-0 min-h-[120px]">
        <CardTitle className="text-lg font-bold font-sans leading-tight line-clamp-2">
          {resource.title}
        </CardTitle>
        <div className="text-sm text-base-content/80 leading-relaxed line-clamp-3 mb-1 font-medium">
          {(resource.summary || resource.description || '').length > 200
            ? (resource.summary || resource.description || '').slice(0, 200) + '…'
            : (resource.summary || resource.description || '')}
        </div>
        {/* Tags */}
        <div className="flex flex-wrap gap-1 mt-auto">
          {visibleTags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="rounded-full px-2 py-0.5 text-xs font-semibold bg-base-200 text-base-content border-none shadow-none capitalize"
            >
              {tag}
            </Badge>
          ))}
          {extraTags.length > 0 && (
            <Badge
              variant="outline"
              className="rounded-full px-2 py-0.5 text-xs font-semibold bg-base-300 text-base-content/60 border-none shadow-none"
              title={extraTags.join(', ')}
            >
              +{extraTags.length}
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex items-end justify-between px-5 pb-4 pt-2 mt-auto border-none bg-transparent">
        {/* Views */}
        <div className="flex items-center gap-1 text-base-content/70 font-semibold text-sm">
          <Eye className="w-4 h-4 text-base-content/60" />
          <span>{resource.metrics?.views ?? 0}</span>
          <span className="ml-1 font-normal text-xs text-base-content/50">views</span>
        </div>
        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Bookmark Button */}
          {onBookmark && (
            <Button
              variant="ghost"
              size="sm"
              className={`font-semibold text-xs px-2 py-1 rounded-full transition-colors min-h-0 h-8 ${
                resource.isBookmarked 
                  ? 'text-warning hover:bg-warning/10' 
                  : 'text-base-content/60 hover:bg-base-200'
              }`}
              onClick={e => {
                e.stopPropagation();
                onBookmark?.(resource);
              }}
            >
              <Bookmark className={`w-4 h-4 ${resource.isBookmarked ? 'fill-current' : ''}`} />
            </Button>
          )}
          {/* View Details Button */}
          <Button
            variant="ghost"
            size="sm"
            className="font-semibold text-primary text-xs px-3 py-1 rounded-full border border-primary/20 hover:bg-primary/10 hover:text-primary-700 transition-colors min-h-0 h-8"
            onClick={e => {
              e.stopPropagation();
              onView?.(resource);
            }}
          >
            View Details
            {resource.url && <ExternalLink className="w-4 h-4 ml-1" />}
          </Button>
        </div>
      </CardFooter>
      {/* Subtle overlay for hover effect */}
      <div className="absolute inset-0 pointer-events-none rounded-xl transition-all duration-200" />
    </Card>
  );
}; 