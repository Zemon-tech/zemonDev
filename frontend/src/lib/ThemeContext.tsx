import { createContext, useState, useEffect, useContext } from 'react';
import type { ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Helper function to apply theme to document
const applyTheme = (theme: Theme) => {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  
  // Store in localStorage
  localStorage.setItem('theme', theme);
  
  console.log(`Applied theme: ${theme}`);
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');

  // Initialize theme on mount
  useEffect(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      console.log(`Initializing with saved theme: ${savedTheme}`);
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      // If no saved theme but system prefers dark
      console.log('System prefers dark theme, setting dark');
      setTheme('dark');
      applyTheme('dark');
    } else {
      // Default to light theme
      console.log('No theme preference detected, defaulting to light');
      setTheme('light');
      applyTheme('light');
    }

    // Add listener for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        const newTheme = e.matches ? 'dark' : 'light';
        console.log(`System theme preference changed, setting ${newTheme}`);
        setTheme(newTheme);
        applyTheme(newTheme);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    console.log(`Toggling theme from ${theme} to ${newTheme}`);
    
    // Update state
    setTheme(newTheme);
    
    // Apply theme to document
    applyTheme(newTheme);
    
    console.log(`Theme toggled. Current theme: ${newTheme}`);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 