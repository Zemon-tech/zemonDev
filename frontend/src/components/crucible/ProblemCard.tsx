// Problem type inferred from dummyProblems in CruciblePage
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

// Badge subcomponent for consistent style
function Badge({ children, color = 'badge-outline', className = '' }: { children: React.ReactNode; color?: string; className?: string }) {
  return <span className={`badge ${color} ${className}`}>{children}</span>;
}

// Icon/Image subcomponent
function ProblemIcon({ iconUrl }: { iconUrl?: string }) {
  // Use Zemon.svg as default
  if (!iconUrl) {
    return (
      <span className="bg-base-200 rounded-xl p-2 flex items-center justify-center w-12 h-12">
        <img src="/Zemon.svg" alt="Problem Icon" className="w-8 h-8 object-contain" />
      </span>
    );
  }
  // If SVG or image provided
  return (
    <span className="bg-base-200 rounded-xl p-2 flex items-center justify-center w-12 h-12">
      <img src={iconUrl} alt="Problem Icon" className="w-8 h-8 object-contain" />
    </span>
  );
}

const difficultyColor: Record<Problem['difficulty'], string> = {
  easy: 'badge-success',
  medium: 'badge-info',
  hard: 'badge-warning',
  expert: 'badge-error',
};

export default function ProblemCard({ problem, onSelect }: Props) {
  return (
    <div
      className="card card-border bg-base-100 shadow-md hover:shadow-xl hover:scale-[1.03] transition-transform duration-200 w-full max-w-sm min-w-[22rem] h-80 flex flex-col cursor-pointer group"
      onClick={() => onSelect?.(problem)}
    >
      <div className="card-body flex flex-col gap-2 p-4">
        <div className="flex items-center gap-3 mb-1">
          <ProblemIcon iconUrl={problem.iconUrl} />
          <div className="flex-1 min-w-0">
            <h2 className="card-title text-base font-semibold leading-tight truncate" title={problem.title}>
              {problem.title}
            </h2>
            <Badge color={difficultyColor[problem.difficulty]} className="capitalize mt-1">
              {problem.difficulty}
            </Badge>
          </div>
        </div>
        <p className="text-base-content/80 text-sm mb-1 line-clamp-3 flex-1" title={problem.description}>
          {problem.description}
        </p>
        <div className="flex flex-wrap gap-1 mb-2">
          {problem.tags.map((tag) => (
            <Badge key={tag} className="capitalize text-xs bg-base-200/70">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="card-actions mt-auto flex justify-end">
          <button
            className="btn btn-primary btn-sm rounded-full px-4 group-hover:scale-105 transition-transform"
            onClick={e => { e.stopPropagation(); onSelect?.(problem); }}
          >
            Solve Now
          </button>
        </div>
      </div>
    </div>
  );
} 