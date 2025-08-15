import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ClerkProvider, useAuth, useUser } from "@clerk/clerk-react";
import { ThemeProvider } from './lib/ThemeContext';
import { SidebarProvider } from './lib/SidebarContext';
import { WorkspaceProvider } from './lib/WorkspaceContext';
import { ToastProvider } from './components/ui/toast';

// Layouts
import PublicLayout from './components/layout/PublicLayout';
import AppLayout from './components/layout/AppLayout';

// Public Pages (auth only: sign-in/sign-up)
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';

import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import PublicProfilePage from './pages/PublicProfilePage';

// App Pages
import DashboardPage from './pages/DashboardPage';

import ForgePage from './pages/ForgePage';
import ForgeDetailPage from './pages/ForgeDetailPage';
import ForgeCategoryPage from './pages/ForgeCategoryPage';
import CruciblePage from './pages/CruciblePage';
import CrucibleCategoryPage from './pages/CrucibleCategoryPage';
import CrucibleProblemPage from './pages/CrucibleProblemPage';
import ResultPage from './pages/ResultPage';
import ArenaPage from './pages/ArenaPage';
import AdminPage from './pages/AdminPage';
import ProtectedAdminRoute from './components/admin/ProtectedAdminRoute';
import { UserRoleProvider } from './context/UserRoleContext';
import { AnalysisProvider } from './context/AnalysisContext';
import { SocketProvider } from './context/SocketContext';
import { ForgeProvider } from './context/ForgeContext';
// Removed public pages: Landing, About, Blogs, Pricing, Developers

// Root route component to handle authenticated users
function RootRoute() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  
  // Wait for Clerk to load
  if (!isLoaded) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  // If user is signed in, redirect to their dashboard
  if (isSignedIn && user) {
    // Use username if available, otherwise use a fallback
    const username = user.username || `user${user.id.slice(-8)}`;
    return <Navigate to={`/${username}/dashboard`} replace />;
  }
  
  // Otherwise, redirect to sign-in
  return <Navigate to="/signin" replace />;
}

// Wrap AppLayout with WorkspaceProvider, UserRoleProvider, and AnalysisProvider
const WorkspaceLayout = () => {
  return (
    <WorkspaceProvider>
      <SocketProvider>
        <UserRoleProvider>
          <AnalysisProvider>
            <ForgeProvider>
              <AppLayout />
            </ForgeProvider>
          </AnalysisProvider>
        </UserRoleProvider>
      </SocketProvider>
    </WorkspaceProvider>
  );
}

function App() {
  // Configure Clerk with the publishable key
  const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_placeholder';
  
  return (
    <ClerkProvider 
      publishableKey={publishableKey}
      // Specify not to use the Authorization header in browser contexts
      // This prevents conflicts with the Origin header that browsers automatically add
      // and avoids the "For security purposes, only one of the 'Origin' and 'Authorization' headers should be provided" error
    >
      <ThemeProvider>
        <SidebarProvider>
          <ToastProvider>
            <Router>
              <Routes>
                {/* Public Routes (auth only) */}
                <Route element={<PublicLayout />}>
                  {/* Root Route - Redirects to dashboard if authenticated */}
                  <Route path="/" element={<RootRoute />} />
                  <Route path="/signin" element={<SignInPage />} />
                  <Route path="/signup" element={<SignUpPage />} />
                </Route>
                
                {/* Protected Routes - Username based */}
                <Route path=":username" element={<WorkspaceLayout />}>
                  <Route index element={<ProfilePage />} />
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="forge" element={<ForgePage />} />
                  <Route path="forge/:id" element={<ForgeDetailPage />} />
                  <Route path="forge/category/:categoryId" element={<ForgeCategoryPage />} />
                  <Route path="crucible" element={<CruciblePage />} />
                  <Route path="crucible/category/:categoryId" element={<CrucibleCategoryPage />} />
                  <Route path="crucible/problem/:id" element={<CrucibleProblemPage />} />
                  <Route path="crucible/problem/:id/result" element={<ResultPage />} />
                  <Route path="crucible/results/:analysisId" element={<ResultPage />} />
                  <Route path="arena" element={<ArenaPage />} />
                  <Route path="admin" element={
                    <ProtectedAdminRoute>
                      <AdminPage />
                    </ProtectedAdminRoute>
                  } />
                  <Route path="settings" element={<SettingsPage />} />
                </Route>
                
                {/* Public Profile Routes - Accessible without authentication */}
                <Route path="/profile/:username" element={<PublicProfilePage />} />
                
                {/* Catch-all route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Router>
          </ToastProvider>
        </SidebarProvider>
      </ThemeProvider>
    </ClerkProvider>
  );
}

export default App;
