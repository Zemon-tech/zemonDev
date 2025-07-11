// Problem type inferred from dummyProblems in CruciblePage
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { Badge } from '@/components/ui/badge';

export type Problem = {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  tags: string[];
  iconUrl?: string; // Optional icon/image/svg url
};

type Props = {
  problem: Problem;
  onSelect?: (problem: Problem) => void;
};

// Icon/Image subcomponent
function ProblemIcon({ iconUrl, difficulty }: { iconUrl?: string; difficulty: Problem['difficulty'] }) {
  const bgColorMap: Record<Problem['difficulty'], string> = {
    easy: 'bg-gray-100 dark:bg-gray-800/40',
    medium: 'bg-gray-100 dark:bg-gray-800/40',
    hard: 'bg-gray-100 dark:bg-gray-800/40',
    expert: 'bg-gray-100 dark:bg-gray-800/40',
  };
  
  // Use Zemon.svg as default
  if (!iconUrl) {
    return (
      <span className={cn(
        "rounded-lg p-1.5 flex items-center justify-center w-10 h-10 shadow-sm",
        bgColorMap[difficulty]
      )}>
        <img src="/Zemon.svg" alt="Problem Icon" className="w-6 h-6 object-contain" />
      </span>
    );
  }
  // If SVG or image provided
  return (
    <span className={cn(
      "rounded-lg p-1.5 flex items-center justify-center w-10 h-10 shadow-sm",
      bgColorMap[difficulty]
    )}>
      <img src={iconUrl} alt="Problem Icon" className="w-6 h-6 object-contain" />
    </span>
  );
}

// Tag component with tooltip support
function TagBadge({ tag, onClick }: { tag: string; onClick?: (e: React.MouseEvent) => void }) {
  return (
    <Badge
      variant="outline"
      className="capitalize text-xs px-2 py-0.5 cursor-pointer"
      onClick={onClick}
    >
      {tag}
    </Badge>
  );
}

// Tag overflow component with tooltip
function TagOverflow({ 
  count, 
  tags, 
  onClick 
}: { 
  count: number; 
  tags: string[]; 
  onClick?: (e: React.MouseEvent) => void 
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setShowTooltip(false);
      }
    };
    
    if (showTooltip) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTooltip]);
  
  return (
    <div className="relative" ref={tooltipRef}>
      <span 
        className="badge badge-outline badge-sm text-[0.75rem] whitespace-nowrap px-2 py-0.5 flex-shrink-0 opacity-70 hover:opacity-100 cursor-pointer bg-background/50 hover:bg-background transition-all"
        onClick={(e) => {
          e.stopPropagation();
          setShowTooltip(!showTooltip);
          onClick?.(e);
        }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={(e) => {
          // Don't hide if moving to tooltip
          if (e.relatedTarget && tooltipRef.current?.contains(e.relatedTarget as Node)) {
            return;
          }
          setShowTooltip(false);
        }}
      >
        +{count}
      </span>
      
      {showTooltip && (
        <div 
          className="absolute bottom-full left-0 mb-1.5 bg-background border border-border rounded-lg shadow-md p-2 z-10 min-w-[150px] max-w-[250px] animate-in fade-in-50 zoom-in-95 duration-100"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto scrollbar-hide">
            {tags.map(tag => (
              <TagBadge 
                key={tag} 
                tag={tag}
                onClick={(e) => e.stopPropagation()}
              />
            ))}
          </div>
          <div className="absolute w-2 h-2 bg-background border-r border-b border-border rotate-45 -bottom-1 left-3"></div>
        </div>
      )}
    </div>
  );
}

// Replace difficulty badge with Badge and color variants
const difficultyColor: Record<Problem['difficulty'], string> = {
  easy: 'bg-green-100 text-green-700 border-green-300',
  medium: 'bg-blue-100 text-blue-700 border-blue-300',
  hard: 'bg-amber-100 text-amber-700 border-amber-300',
  expert: 'bg-red-100 text-red-700 border-red-300',
};

export default function ProblemCard({ problem, onSelect }: Props) {
  // Display logic for tags
  const MAX_VISIBLE_TAGS = 4;
  const visibleTags = problem.tags.slice(0, MAX_VISIBLE_TAGS);
  const hiddenTags = problem.tags.slice(MAX_VISIBLE_TAGS);
  const hasHiddenTags = hiddenTags.length > 0;
  
  // For smaller screens, show fewer tags
  const MAX_MOBILE_TAGS = 2;
  const visibleMobileTags = problem.tags.slice(0, MAX_MOBILE_TAGS);
  const hiddenMobileTags = problem.tags.slice(MAX_MOBILE_TAGS);
  const hasHiddenMobileTags = hiddenMobileTags.length > 0;

  // Map difficulty to badge style
  const difficultyStyles: Record<Problem['difficulty'], string> = {
    easy: 'border-green-500 text-green-700 dark:text-green-400',
    medium: 'border-blue-500 text-blue-700 dark:text-blue-400',
    hard: 'border-amber-500 text-amber-700 dark:text-amber-400',
    expert: 'border-red-500 text-red-700 dark:text-red-400',
  };

  const [isHovered, setIsHovered] = useState(false);
  
  // Get difficulty color
  const getDifficultyColor = () => {
    switch (problem.difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'hard': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'expert': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <Card 
      className="h-full flex flex-col bg-base-100 border shadow-sm rounded-xl overflow-hidden"
      onClick={() => onSelect?.(problem)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="pb-0 px-3 pt-2.5 space-y-0">
        <div className="flex items-start gap-2">
          <ProblemIcon iconUrl={problem.iconUrl} difficulty={problem.difficulty} />
          <div className="flex-1 min-w-0 flex flex-col pt-0.5">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-base font-extrabold leading-tight truncate">
                {problem.title}
              </CardTitle>
              <div className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor()}`}>
                {problem.difficulty}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-[3.5em] pb-2 pt-0 px-6">
        <CardDescription 
          className="line-clamp-3 text-[0.97rem] text-muted-foreground leading-snug min-h-[3.5em]"
          title={problem.description}
        >
          {problem.description}
        </CardDescription>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 items-stretch px-6 pt-0 pb-4 mt-auto">
        <div className="flex flex-wrap gap-1 min-h-[2.2em]">
          {/* Desktop view (>= md) */}
          <div className="hidden md:flex items-center gap-1 flex-wrap">
            {visibleTags.map((tag) => (
              <TagBadge key={tag} tag={tag} onClick={e => e.stopPropagation()} />
            ))}
            {hasHiddenTags && (
              <TagOverflow count={hiddenTags.length} tags={hiddenTags} onClick={e => e.stopPropagation()} />
            )}
          </div>
          {/* Mobile view (< md) */}
          <div className="flex md:hidden items-center gap-1 flex-wrap">
            {visibleMobileTags.map((tag) => (
              <TagBadge key={tag} tag={tag} onClick={e => e.stopPropagation()} />
            ))}
            {hasHiddenMobileTags && (
              <TagOverflow count={hiddenMobileTags.length} tags={hiddenMobileTags} onClick={e => e.stopPropagation()} />
            )}
          </div>
        </div>
        <Button
          size="lg"
          className="w-full mt-2 rounded-full px-6 py-2 h-10 shadow bg-gradient-to-r from-primary to-accent text-primary-content font-bold text-base hover:scale-105 hover:from-primary/80 hover:to-accent/80 transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
          onClick={e => { e.stopPropagation(); onSelect?.(problem); }}
          variant="default"
        >
          Solve Now
        </Button>
      </CardFooter>
      
      <div 
        className={`absolute bottom-0 left-0 w-full h-1 bg-primary transform transition-transform duration-300 ${
          isHovered ? 'scale-x-100' : 'scale-x-0'
        }`}
      />
    </Card>
  );
}