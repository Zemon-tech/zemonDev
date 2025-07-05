import { useParams } from 'react-router-dom';
import CrucibleWorkspaceView from '../components/crucible/CrucibleWorkspaceView';

export default function CrucibleProblemPage() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return <div className="flex items-center justify-center h-screen">Problem not found.</div>;
  }

  return <CrucibleWorkspaceView problemId={id} />;
}