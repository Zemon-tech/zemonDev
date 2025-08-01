import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="h-screen overflow-hidden">
      <main className="h-full">
        <Outlet />
      </main>
    </div>
  );
}