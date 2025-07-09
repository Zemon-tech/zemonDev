import { createContext, useState, useEffect, useContext } from 'react';
import type { ReactNode } from 'react';

// Define available themes
type Theme = string;

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDarkTheme: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Helper function to apply theme to document
const applyTheme = (theme: Theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  
  // Store in localStorage
  localStorage.setItem('theme', theme);
};

// Helper to check if a theme is dark
const isDarkTheme = (theme: Theme): boolean => {
  // These are the themes that should be considered "dark"
  const darkThemes = [
    'dark',
    'synthwave',
    'halloween',
    'forest',
    'black',
    'luxury',
    'dracula',
    'night',
    'coffee',
    'business',
    'acid',
    'cyberpunk'
  ];
  return darkThemes.includes(theme);
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [isDark, setIsDark] = useState(false);

  // Function to set theme
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    setIsDark(isDarkTheme(newTheme));
    applyTheme(newTheme);
    
    // Also update the class for non-DaisyUI components that rely on dark mode
    if (isDarkTheme(newTheme)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Initialize theme on mount
  useEffect(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
      setThemeState(savedTheme);
      setIsDark(isDarkTheme(savedTheme));
      applyTheme(savedTheme);
      
      // Also update the class for non-DaisyUI components that rely on dark mode
      if (isDarkTheme(savedTheme)) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      // If no saved theme but system prefers dark
      setThemeState('dark');
      setIsDark(true);
      applyTheme('dark');
      document.documentElement.classList.add('dark');
    } else {
      // Default to light theme
      setThemeState('light');
      setIsDark(false);
      applyTheme('light');
      document.documentElement.classList.remove('dark');
    }

    // Add listener for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        const newTheme = e.matches ? 'dark' : 'light';
        setThemeState(newTheme);
        setIsDark(e.matches);
        applyTheme(newTheme);
        
        // Also update the class for non-DaisyUI components that rely on dark mode
        if (e.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDarkTheme: isDark }}>
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