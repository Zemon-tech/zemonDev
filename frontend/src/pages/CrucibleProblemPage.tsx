import { useParams } from 'react-router-dom';
import CrucibleWorkspaceView from '../components/crucible/CrucibleWorkspaceView';
import { WorkspaceProvider } from '@/lib/WorkspaceContext';

export default function CrucibleProblemPage() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return <div className="flex items-center justify-center h-screen">Problem not found.</div>;
  }

  return (
    <WorkspaceProvider>
      <CrucibleWorkspaceView problemId={id} />
    </WorkspaceProvider>
  );
}