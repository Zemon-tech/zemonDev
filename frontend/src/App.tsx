import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ClerkProvider, useAuth, useUser } from "@clerk/clerk-react";
import { ThemeProvider } from './lib/ThemeContext';
import { withAuth, useClerkToken } from './lib/middleware';
import { WorkspaceProvider } from './lib/WorkspaceContext';
import { useEffect } from 'react';

// Layouts
import PublicLayout from './components/layout/PublicLayout';
import AppLayout from './components/layout/AppLayout';

// Public Pages
import LandingPage from './pages/LandingPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';

// App Pages
import DashboardPage from './pages/DashboardPage';
import PlaceholderPage from './pages/PlaceholderPage';
import ForgePage from './pages/ForgePage';
import ForgeDetailPage from './pages/ForgeDetailPage';
import CruciblePage from './pages/CruciblePage';
import CrucibleProblemPage from './pages/CrucibleProblemPage';

// Protected route wrapper
const ProtectedDashboard = withAuth(DashboardPage);
const ProtectedPlaceholder = withAuth(PlaceholderPage);
const ProtectedForgePage = withAuth(ForgePage);
const ProtectedForgeDetailPage = withAuth(ForgeDetailPage);
const ProtectedCruciblePage = withAuth(CruciblePage);
const ProtectedCrucibleProblemPage = withAuth(CrucibleProblemPage);

// Root route component to handle authenticated users
function RootRoute() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  
  // Set up the auth token
  useClerkToken();
  
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
  
  // Otherwise, show the landing page
  return <LandingPage />;
}

// Wrap AppLayout with WorkspaceProvider
const WorkspaceLayout = () => {
  // Set up the auth token for the workspace layout
  useClerkToken();
  const { isSignedIn, isLoaded } = useAuth();
  
  // Log authentication state for debugging
  useEffect(() => {
    console.log('WorkspaceLayout auth state:', { isLoaded, isSignedIn });
  }, [isLoaded, isSignedIn]);
  
  return (
    <WorkspaceProvider>
      <AppLayout />
    </WorkspaceProvider>
  );
}

function App() {
  // Configure Clerk with the publishable key
  const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_placeholder';
  
  // Log the key for debugging (without revealing the full key)
  useEffect(() => {
    const keyPrefix = publishableKey.substring(0, 8);
    console.log(`Using Clerk with key prefix: ${keyPrefix}...`);
  }, [publishableKey]);
  
  return (
    <ClerkProvider publishableKey={publishableKey}>
      <ThemeProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route element={<PublicLayout />}>
              {/* Root Route - Redirects to dashboard if authenticated */}
              <Route path="/" element={<RootRoute />} />
              <Route path="/signin" element={<SignInPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/about" element={<PlaceholderPage title="About" />} />
              <Route path="/blogs" element={<PlaceholderPage title="Blogs" />} />
              <Route path="/pricing" element={<PlaceholderPage title="Pricing" />} />
              <Route path="/developers" element={<PlaceholderPage title="Developers" />} />
            </Route>
            
            {/* Protected Routes - Username based */}
            <Route path="/:username" element={<WorkspaceLayout />}>
              <Route path="dashboard" element={<ProtectedDashboard />} />
              <Route path="forge" element={<ProtectedForgePage />} />
              <Route path="forge/:id" element={<ProtectedForgeDetailPage />} />
              <Route path="crucible" element={<ProtectedCruciblePage />} />
              <Route path="crucible/problem/:id" element={<ProtectedCrucibleProblemPage />} />
              <Route path="arena" element={<ProtectedPlaceholder title="Arena" description="Compete with peers in coding competitions." />} />
              <Route path="profile" element={<ProtectedPlaceholder title="Profile" description="Manage your public profile and showcase your achievements." />} />
              <Route path="settings" element={<ProtectedPlaceholder title="Settings" description="Configure your account settings and preferences." />} />
            </Route>
            
            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </ClerkProvider>
  );
}

export default App;
