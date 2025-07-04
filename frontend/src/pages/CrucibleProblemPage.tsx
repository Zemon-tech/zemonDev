import { useParams } from 'react-router-dom';
import CrucibleWorkspaceView from '../components/crucible/CrucibleWorkspaceView';

// Dummy data for now
const dummyProblems = [
  {
    id: '1',
    title: 'Design a URL Shortener (like bit.ly)',
    description: 'Build a scalable service to shorten URLs, handle redirects, and track analytics. Consider database schema, unique code generation, and high availability.',
    difficulty: 'easy' as 'easy',
    tags: ['database', 'api', 'scaling', 'backend'],
  },
  // ... add more as needed
];

export default function CrucibleProblemPage() {
  const { id } = useParams();
  const problem = dummyProblems.find(p => p.id === id);

  if (!problem) {
    return <div className="flex items-center justify-center h-screen">Problem not found.</div>;
  }

  // Use the unified workspace view
  return (
    <CrucibleWorkspaceView problem={problem} />
  );
}