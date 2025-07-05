// Problem type inferred from dummyProblems in CruciblePage
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";

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
    <span 
      className="badge badge-outline badge-sm capitalize text-[0.75rem] whitespace-nowrap px-2 py-0.5 flex-shrink-0"
      onClick={onClick}
    >
      {tag}
    </span>
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

  return (
    <Card 
      className="rounded-lg border border-border/30 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200 cursor-pointer h-full flex flex-col"
      onClick={() => onSelect?.(problem)}
    >
      <CardHeader className="pb-0 px-3 pt-2.5 space-y-0">
        <div className="flex items-start gap-2">
          <ProblemIcon iconUrl={problem.iconUrl} difficulty={problem.difficulty} />
          <div className="flex-1 min-w-0 flex flex-col pt-0.5">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-base font-bold leading-tight truncate">
                {problem.title}
              </CardTitle>
              <span 
                className={cn(
                  "text-[0.7rem] font-medium px-1.5 py-0.5 rounded-md border capitalize whitespace-nowrap",
                  difficultyStyles[problem.difficulty]
                )}
              >
                {problem.difficulty}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="py-1 px-3 flex-1">
        <CardDescription 
          className="line-clamp-2 text-[0.8125rem] text-muted-foreground leading-snug"
          title={problem.description}
        >
          {problem.description}
        </CardDescription>
      </CardContent>
      
      <div className="h-px bg-border/30 mx-3"></div>
      
      <CardFooter className="px-3 py-2 flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          {/* Desktop view (>= md) */}
          <div className="hidden md:flex items-center gap-1 flex-nowrap">
            {visibleTags.map((tag) => (
              <TagBadge 
                key={tag} 
                tag={tag}
                onClick={(e) => e.stopPropagation()}
              />
            ))}
            
            {hasHiddenTags && (
              <TagOverflow 
                count={hiddenTags.length} 
                tags={hiddenTags} 
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </div>
          
          {/* Mobile view (< md) */}
          <div className="flex md:hidden items-center gap-1 flex-nowrap">
            {visibleMobileTags.map((tag) => (
              <TagBadge 
                key={tag} 
                tag={tag}
                onClick={(e) => e.stopPropagation()}
              />
            ))}
            
            {hasHiddenMobileTags && (
              <TagOverflow 
                count={hiddenMobileTags.length} 
                tags={hiddenMobileTags}
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </div>
        </div>
        
        <Button
          size="sm"
          className="rounded-full px-3 py-0.5 h-6 hover:bg-primary/90 hover:scale-[1.02] transition-all shadow-sm flex-shrink-0 font-medium text-xs"
          onClick={e => { e.stopPropagation(); onSelect?.(problem); }}
        >
          Solve Now
        </Button>
      </CardFooter>
    </Card>
  );
}