import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ClerkProvider } from "@clerk/clerk-react";
import { ThemeProvider } from './lib/ThemeContext';
import Navbar from './components/layout/Navbar';
import LandingPage from './pages/LandingPage';

function App() {
  return (
    <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_placeholder'}>
      <ThemeProvider>
        <Router>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              {/* Add more routes as needed */}
            </Routes>
          </div>
        </Router>
      </ThemeProvider>
    </ClerkProvider>
  );
}

export default App;
