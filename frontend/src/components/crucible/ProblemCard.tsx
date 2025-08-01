// Problem type inferred from dummyProblems in CruciblePage
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import SubjectIcon from '@/components/ui/SubjectIcon';
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
function ProblemIcon({ iconUrl }: { iconUrl?: string; difficulty: Problem['difficulty'] }) {
  return (
    <span className={cn(
      "rounded-lg p-1.5 flex items-center justify-center w-10 h-10 shadow-sm border border-base-200 bg-base-200 dark:bg-base-300/40"
    )}>
      {iconUrl ? (
        <img src={iconUrl} alt="Problem Icon" className="w-6 h-6 object-contain" />
      ) : (
        <SubjectIcon className="w-6 h-6" />
      )}
    </span>
  );
}

// Tag component with tooltip support
function TagBadge({ tag, onClick }: { tag: string; onClick?: (e: React.MouseEvent) => void }) {
  return (
    <Badge
      variant="secondary"
      className="capitalize text-xs px-2 py-0.5 rounded-full bg-base-200 text-base-content border-none shadow-none cursor-pointer"
      onClick={onClick}
    >
      {tag}
    </Badge>
  );
}

// Tag overflow component with tooltip
function TagOverflow({ count, tags, onClick }: { count: number; tags: string[]; onClick?: (e: React.MouseEvent) => void }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

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
        className="badge badge-outline badge-sm text-[0.75rem] whitespace-nowrap px-2 py-0.5 flex-shrink-0 opacity-70 hover:opacity-100 cursor-pointer bg-base-200 text-base-content border-none transition-all rounded-full"
        onClick={(e) => {
          e.stopPropagation();
          setShowTooltip(!showTooltip);
          onClick?.(e);
        }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={(e) => {
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
          className="absolute bottom-full left-0 mb-1.5 bg-base-100 border border-base-300 rounded-lg shadow-md p-2 z-10 min-w-[150px] max-w-[250px] animate-in fade-in-50 zoom-in-95 duration-100"
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
          <div className="absolute w-2 h-2 bg-base-100 border-r border-b border-base-300 rotate-45 -bottom-1 left-3"></div>
        </div>
      )}
    </div>
  );
}

const difficultyColor: Record<Problem['difficulty'], string> = {
  easy: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  hard: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  expert: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

export default function ProblemCard({ problem, onSelect }: Props) {
  const MAX_TAGS = 4;
  const visibleTags = problem.tags.slice(0, MAX_TAGS);
  const extraTags = problem.tags.length > MAX_TAGS ? problem.tags.slice(MAX_TAGS) : [];

  const [isHovered, setIsHovered] = useState(false);
  const [isButtonHovered, setIsButtonHovered] = useState(false);

  return (
    <Card
      className={cn(
        // Glassmorphism + premium border/shadow
        "h-full flex flex-col bg-base-100/80 dark:bg-base-200/60 backdrop-blur-[2.5px] border border-primary/20 shadow-[0_4px_32px_0_rgba(80,80,120,0.10)] rounded-2xl overflow-hidden transition-all duration-300 relative",
        "hover:shadow-2xl hover:scale-[1.015] cursor-pointer p-0 group"
      )}
      onClick={() => onSelect?.(problem)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ minHeight: 240, maxHeight: 340 }}
    >
      {/* Animated accent icon */}
      <span className={cn(
        "absolute top-4 right-4 z-10 transition-transform duration-300",
        isHovered ? "scale-110 rotate-6" : "scale-100 rotate-0"
      )}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles drop-shadow-glow animate-spin-slow">
          <path d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.07-7.07-1.41 1.41M6.34 17.66l-1.41 1.41m12.02 0-1.41-1.41M6.34 6.34 4.93 4.93" />
        </svg>
      </span>
      <CardHeader className="pb-2 pt-5 px-6 flex flex-row items-center gap-3 border-none bg-transparent">
        <ProblemIcon iconUrl={problem.iconUrl} difficulty={problem.difficulty} />
        <div className="flex-1 min-w-0 flex flex-col pt-0.5">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-xl font-extrabold font-sans leading-tight line-clamp-2 tracking-tight text-primary drop-shadow-sm">
              {problem.title}
            </CardTitle>
            <span className={cn(
              "px-3 py-1 rounded-full text-xs font-semibold capitalize border-none shadow-none ml-2",
              difficultyColor[problem.difficulty]
            )}>
              {problem.difficulty}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-2 px-6 pb-2 pt-0 min-h-[72px]">
        <CardDescription
          className="line-clamp-3 text-base text-base-content/80 leading-relaxed mb-1 font-medium min-h-[3.5em]"
          title={problem.description}
        >
          {problem.description}
        </CardDescription>
        {/* Tags */}
        <div className="flex flex-wrap gap-1 mt-auto">
          {visibleTags.map((tag) => (
            <TagBadge key={tag} tag={tag} onClick={e => e.stopPropagation()} />
          ))}
          {extraTags.length > 0 && (
            <TagOverflow count={extraTags.length} tags={extraTags} onClick={e => e.stopPropagation()} />
          )}
        </div>
      </CardContent>
      <CardFooter className="flex items-end justify-end px-6 pb-5 pt-2 mt-auto border-none bg-transparent">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "font-semibold text-primary text-xs px-5 py-2 rounded-full border border-primary/30 min-h-0 h-9 relative overflow-hidden",
            "transition-all duration-200",
            isButtonHovered ? "shadow-[0_0_0_3px_rgba(167,139,250,0.18)] bg-gradient-to-tr from-primary/10 to-accent/10 scale-105" : "hover:shadow-[0_0_0_4px_rgba(167,139,250,0.22)] hover:bg-gradient-to-tr hover:from-primary/20 hover:to-accent/20"
          )}
          style={{ boxShadow: isButtonHovered ? '0 2px 16px 0 rgba(167,139,250,0.10)' : undefined }}
          onClick={e => { e.stopPropagation(); onSelect?.(problem); }}
          onMouseEnter={() => setIsButtonHovered(true)}
          onMouseLeave={() => setIsButtonHovered(false)}
        >
          <span className="relative z-10 flex items-center gap-1">
            <svg className="w-4 h-4 text-primary animate-bounce-x" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            Solve Now
          </span>
          {/* Glowing animated effect */}
          <span className={cn(
            "absolute inset-0 rounded-full pointer-events-none transition-opacity duration-300",
            isButtonHovered ? "opacity-60 bg-gradient-to-tr from-primary/30 via-accent/20 to-secondary/20 blur-[6px] animate-pulse" : "opacity-0"
          )}></span>
        </Button>
      </CardFooter>
      {/* Subtle animated accent bar on hover */}
      <div
        className={cn(
          "absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-secondary transform transition-transform duration-300",
          isHovered ? "scale-x-100" : "scale-x-0"
        )}
      />
    </Card>
  );
}