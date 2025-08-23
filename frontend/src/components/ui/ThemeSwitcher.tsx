import { useState, useEffect, useRef } from "react";
import { Check, ChevronDown, Sun, Moon, Zap, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/ThemeContext";

type Theme = {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  gradient: string;
};

// Curated premium themes with beautiful descriptions and icons
const themes: Theme[] = [
  { 
    id: "light", 
    name: "Light", 
    icon: <Sun className="w-4 h-4" />,
    description: "Clean & bright",
    gradient: "from-amber-400 to-orange-500"
  },
  { 
    id: "halloween", 
    name: "Halloween", 
    icon: <Flame className="w-4 h-4" />,
    description: "Spooky & vibrant",
    gradient: "from-orange-500 to-purple-600"
  },
  { 
    id: "bumblebee", 
    name: "Bumblebee", 
    icon: <Zap className="w-4 h-4" />,
    description: "Energetic & warm",
    gradient: "from-yellow-400 to-amber-500"
  },
  { 
    id: "dark", 
    name: "Dark", 
    icon: <Moon className="w-4 h-4" />,
    description: "Elegant & sleek",
    gradient: "from-slate-700 to-slate-900"
  }
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    setIsOpen(false);
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Find the current theme object or default to light
  const currentTheme = themes.find((t) => t.id === theme) || themes[0]!;

  return (
    <div className="relative z-[9999]" ref={dropdownRef}>
      {/* Compact Theme Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2.5 px-3 py-2 rounded-xl bg-gradient-to-r from-base-100/90 to-base-200/90 hover:from-base-200/90 hover:to-base-300/90 border border-base-300/40 shadow-sm hover:shadow-lg transition-all duration-300 backdrop-blur-sm hover:scale-105 active:scale-95 theme-switcher-hover"
      >
        {/* Theme Icon with Gradient Background */}
        <div className={cn(
          "p-1.5 rounded-lg bg-gradient-to-br transition-all duration-300 group-hover:scale-110",
          currentTheme.gradient
        )}>
          <div className="text-white">
            {currentTheme.icon}
          </div>
        </div>
        
        {/* Theme Name */}
        <span className="font-semibold text-sm text-base-content/90 group-hover:text-base-content transition-colors duration-200">
          {currentTheme.name}
        </span>
        
        {/* Chevron Icon */}
        <ChevronDown className={cn(
          "h-3.5 w-3.5 transition-all duration-300 text-base-content/50 group-hover:text-base-content/70", 
          isOpen ? "rotate-180" : ""
        )} />
      </button>

      {/* Premium Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 p-2 rounded-2xl shadow-2xl bg-base-100/95 border border-base-300/30 z-[9999] backdrop-blur-xl animate-in fade-in-0 zoom-in-95">
          <div className="space-y-1">
            {themes.map((t, index) => (
              <button
                key={t.id}
                className={cn(
                  "group w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-xl transition-all duration-300 hover:bg-base-200/60 active:scale-95 scale-transition",
                  theme === t.id && "bg-gradient-to-r from-primary/15 to-primary/5 border border-primary/20 shadow-sm"
                )}
                style={{
                  animationDelay: `${index * 50}ms`,
                  animationName: 'slide-in-from-right-2',
                  animationDuration: '200ms',
                  animationFillMode: 'both',
                  animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                onClick={() => handleThemeChange(t.id)}
              >
                {/* Theme Icon */}
                <div className={cn(
                  "p-1.5 rounded-lg transition-all duration-200 group-hover:scale-110",
                  theme === t.id 
                    ? `bg-gradient-to-br ${t.gradient} shadow-md` 
                    : "bg-base-200/60 group-hover:bg-base-300/60"
                )}>
                  <div className={cn(
                    "transition-colors duration-200",
                    theme === t.id ? "text-white" : "text-base-content/70 group-hover:text-base-content"
                  )}>
                    {t.icon}
                  </div>
                </div>
                
                {/* Theme Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-base-content group-hover:text-base-content/90 transition-colors duration-200">
                    {t.name}
                  </div>
                  <div className="text-xs text-base-content/60 group-hover:text-base-content/70 transition-colors duration-200 truncate">
                    {t.description}
                  </div>
                </div>
                
                {/* Check Icon */}
                {theme === t.id && (
                  <div className="flex-shrink-0">
                    <div className={cn(
                      "p-1 rounded-full bg-gradient-to-br shadow-sm",
                      t.gradient
                    )}>
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 