// Define Problem type locally (copy from ProblemCard)
type Problem = {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  tags: string[];
};

type Props = {
  problem: Problem;
  onBack: () => void;
};

export default function CrucibleWorkspaceView({ problem, onBack }: Props) {
  // Dummy placeholders for requirements, constraints, hints, and solution
  const requirements = [
    'System must handle 10k requests/sec',
    'Shortened URLs should not collide',
  ];
  const constraints = [
    'No third-party URL shortening services',
    'Must use a relational database',
  ];
  const hints = [
    'Think about hash functions for code generation',
    'Consider how to handle analytics efficiently',
  ];

  return (
    <div className="w-full min-h-screen flex flex-col bg-base-200">
      <div className="max-w-7xl w-full mx-auto px-4 py-6 flex flex-col gap-4">
        <button className="btn btn-ghost w-fit mb-2" onClick={onBack}>
          ← Back to Browse
        </button>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Problem Details */}
          <div className="flex flex-col gap-4">
            <div className="card bg-base-100 border border-base-200 shadow p-6 w-full">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold flex-1">{problem.title}</h1>
                <span className={`badge badge-outline capitalize`}>{problem.difficulty}</span>
              </div>
              <p className="mb-3 text-base-content/80">{problem.description}</p>
              <div className="flex flex-wrap gap-2 mb-2">
                {problem.tags.map((tag: string) => (
                  <span key={tag} className="badge badge-ghost capitalize">{tag}</span>
                ))}
              </div>
              {/* Requirements */}
              <div className="mb-2">
                <h3 className="font-semibold text-base mb-1">Requirements</h3>
                <ul className="list-disc list-inside text-sm text-base-content/70">
                  {requirements.map((req, i) => <li key={i}>{req}</li>)}
                </ul>
              </div>
              {/* Constraints */}
              <div className="mb-2">
                <h3 className="font-semibold text-base mb-1">Constraints</h3>
                <ul className="list-disc list-inside text-sm text-base-content/70">
                  {constraints.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </div>
              {/* Hints */}
              <div>
                <h3 className="font-semibold text-base mb-1">Hints</h3>
                <ul className="list-disc list-inside text-sm text-base-content/70">
                  {hints.map((h, i) => <li key={i}>{h}</li>)}
                </ul>
              </div>
            </div>
          </div>
          {/* Solution Workspace */}
          <div className="flex flex-col gap-4">
            <div className="card bg-base-100 border border-base-200 shadow p-6 w-full flex-1 flex flex-col">
              <h2 className="text-xl font-bold mb-2">Your Solution</h2>
              {/* Placeholder for code editor or textarea */}
              <textarea
                className="textarea textarea-bordered w-full min-h-[200px] mb-4"
                placeholder="Write your solution here..."
              />
              <div className="flex gap-2 mt-auto">
                <button className="btn btn-primary">Submit Solution</button>
                <button className="btn btn-ghost">Save Draft</button>
              </div>
            </div>
            {/* Placeholder for AI feedback, solution stats, etc. */}
            <div className="card bg-base-100 border border-base-200 shadow p-4 w-full">
              <h3 className="font-semibold mb-2">AI Feedback (coming soon)</h3>
              <p className="text-sm text-base-content/60">Get instant feedback and suggestions after submitting your solution.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 