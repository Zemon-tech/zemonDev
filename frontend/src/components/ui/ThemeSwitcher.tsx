import { useState, useEffect, useRef } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/ThemeContext";

type Theme = {
  id: string;
  name: string;
};

// Ensure there's at least one theme
const themes: Theme[] = [
  { id: "light", name: "Light" },
  { id: "dark", name: "Dark" },
  { id: "cupcake", name: "Cupcake" },
  { id: "bumblebee", name: "Bumblebee" },
  { id: "emerald", name: "Emerald" },
  { id: "corporate", name: "Corporate" },
  { id: "synthwave", name: "Synthwave" },
  { id: "retro", name: "Retro" },
  { id: "cyberpunk", name: "Cyberpunk" },
  { id: "valentine", name: "Valentine" },
  { id: "halloween", name: "Halloween" },
  { id: "garden", name: "Garden" },
  { id: "forest", name: "Forest" },
  { id: "aqua", name: "Aqua" },
  { id: "lofi", name: "Lo-Fi" },
  { id: "pastel", name: "Pastel" },
  { id: "fantasy", name: "Fantasy" },
  { id: "wireframe", name: "Wireframe" },
  { id: "black", name: "Black" },
  { id: "luxury", name: "Luxury" },
  { id: "dracula", name: "Dracula" },
  { id: "cmyk", name: "CMYK" },
  { id: "autumn", name: "Autumn" },
  { id: "business", name: "Business" },
  { id: "acid", name: "Acid" },
  { id: "lemonade", name: "Lemonade" },
  { id: "night", name: "Night" },
  { id: "coffee", name: "Coffee" },
  { id: "winter", name: "Winter" },
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

  // Find the current theme object or default to the first theme
  // Using non-null assertion because we know themes array is not empty
  const currentTheme = themes.find((t) => t.id === theme) || themes[0]!;

  return (
    <div className="relative z-[9999]" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gradient-to-r from-base-200/80 to-base-300/80 hover:from-base-200 hover:to-base-300 border border-base-300/50 shadow-sm hover:shadow-md transition-all duration-200 backdrop-blur-sm"
      >
        <div className="w-3 h-3 rounded-full bg-gradient-to-br from-primary to-primary/60 shadow-sm"></div>
        <span className="font-medium text-base-content">{currentTheme.name}</span>
        <ChevronDown className={cn("h-4 w-4 transition-transform duration-200 text-base-content/60", isOpen ? "rotate-180" : "")} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-64 p-3 rounded-2xl shadow-2xl bg-base-100/95 border border-base-300/50 z-[9999] max-h-[70vh] overflow-y-auto backdrop-blur-xl">
          <div className="grid grid-cols-1 gap-1">
            {themes.map((t) => (
              <button
                key={t.id}
                className={cn(
                  "flex items-center justify-between px-4 py-3 text-left rounded-xl hover:bg-base-200/80 transition-all duration-200 group",
                  theme === t.id && "bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30 shadow-sm"
                )}
                onClick={() => handleThemeChange(t.id)}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-3 h-3 rounded-full shadow-sm transition-all duration-200",
                    theme === t.id 
                      ? "bg-gradient-to-br from-primary to-primary/60 scale-110" 
                      : "bg-gradient-to-br from-base-300 to-base-400 group-hover:from-base-200 group-hover:to-base-300"
                  )}></div>
                  <span className={cn(
                    "font-medium transition-colors duration-200",
                    theme === t.id ? "text-primary" : "text-base-content group-hover:text-base-content/80"
                  )}>{t.name}</span>
                </div>
                {theme === t.id && <Check className="h-4 w-4 text-primary" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 