import { useNavigate, useParams } from 'react-router-dom';
// Remove broken import
// import CrucibleBrowseView, { type Problem } from '../components/crucible/CrucibleBrowseView';
import ProblemCard, { type Problem } from '../components/crucible/ProblemCard';
// Assume these hooks are available
// import { useCrucibleProblems, useCrucibleSolution } from '@/hooks/crucible';

// Dummy CrucibleBrowseView for now (since file is deleted)
function CrucibleBrowseView({ problems, loading, onSelect }: { problems: Problem[]; loading: boolean; onSelect: (p: Problem) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
      {problems.map((problem) => (
        <ProblemCard key={problem.id} problem={problem} onSelect={onSelect} />
      ))}
    </div>
  );
}

const dummyProblems: Problem[] = [
  {
    id: '1',
    title: 'Design a URL Shortener (like bit.ly)',
    description: 'Build a scalable service to shorten URLs, handle redirects, and track analytics. Consider database schema, unique code generation, and high availability.',
    difficulty: 'easy',
    tags: ['database', 'api', 'scaling', 'backend'],
  },
  {
    id: '2',
    title: 'Real-Time Chat System',
    description: 'Design a real-time chat application supporting 1:1 and group messaging, typing indicators, and message history. Discuss WebSocket usage and data storage.',
    difficulty: 'medium',
    tags: ['realtime', 'api', 'scaling', 'frontend', 'backend'],
  },
  {
    id: '3',
    title: 'Distributed Rate Limiter',
    description: 'Implement a distributed rate limiter for an API gateway. Discuss algorithms (token bucket, leaky bucket), storage (Redis), and consistency.',
    difficulty: 'hard',
    tags: ['api', 'scaling', 'backend', 'security'],
  },
  {
    id: '4',
    title: 'Design GitHub Gist',
    description: 'Build a system for users to create, edit, and share code snippets with versioning and permissions. Consider storage, search, and access control.',
    difficulty: 'medium',
    tags: ['database', 'frontend', 'backend', 'security'],
  },
  {
    id: '5',
    title: 'Notification Delivery System',
    description: 'Design a system to deliver notifications (email, SMS, push) to millions of users reliably and in near real-time. Discuss queuing, retries, and user preferences.',
    difficulty: 'expert',
    tags: ['scaling', 'backend', 'api', 'realtime'],
  },
  {
    id: '6',
    title: 'Design a Pastebin Service',
    description: 'Create a service for users to store and share text/code snippets. Discuss expiration, spam prevention, and syntax highlighting.',
    difficulty: 'easy',
    tags: ['frontend', 'backend', 'security'],
  },
  {
    id: '7',
    title: 'E-commerce Checkout System',
    description: 'Design a robust checkout system for an e-commerce platform. Cover inventory management, payment processing, and order tracking.',
    difficulty: 'hard',
    tags: ['api', 'database', 'security', 'backend'],
  },
  {
    id: '8',
    title: 'Design a News Feed (like Facebook)',
    description: 'Build a personalized, scalable news feed system. Discuss ranking algorithms, caching, and real-time updates.',
    difficulty: 'expert',
    tags: ['scaling', 'database', 'frontend', 'backend'],
  },
];

export default function CruciblePage() {
  const navigate = useNavigate();
  const { username } = useParams();
  const problems = dummyProblems;

  // TODO: Replace with real hooks
  // const { problems, loading } = useCrucibleProblems();
  // const { solution, loading: solutionLoading } = useCrucibleSolution(selectedProblem?.id);

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 min-h-screen">
      <CrucibleBrowseView
        problems={problems}
        loading={false}
        onSelect={(problem) => {
          navigate(`/${username}/crucible/problem/${problem.id}`);
        }}
      />
    </div>
  );
} 