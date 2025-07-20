import { useState } from "react";
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

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    setIsOpen(false);
  };

  // Find the current theme object or default to the first theme
  // Using non-null assertion because we know themes array is not empty
  const currentTheme = themes.find((t) => t.id === theme) || themes[0]!;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-md bg-base-200 hover:bg-base-300 transition-colors"
      >
        <span className="hidden sm:inline">Theme:</span>
        <span>{currentTheme.name}</span>
        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen ? "rotate-180" : "")} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 p-2 rounded-md shadow-lg bg-base-100 border border-base-300 z-50 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 gap-1">
            {themes.map((t) => (
              <button
                key={t.id}
                className={cn(
                  "flex items-center justify-between px-3 py-2 text-left rounded-md hover:bg-base-200",
                  theme === t.id && "bg-primary text-primary-content"
                )}
                onClick={() => handleThemeChange(t.id)}
              >
                <span>{t.name}</span>
                {theme === t.id && <Check className="h-4 w-4" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 