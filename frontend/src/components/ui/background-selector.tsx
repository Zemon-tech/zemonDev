import { useState } from 'react';
import { motion } from 'framer-motion';
import { Palette, Image, Sparkles, X } from 'lucide-react';
import { Button } from './button';

interface BackgroundOption {
  id: string;
  name: string;
  type: 'gradient' | 'image';
  value: string;
  preview?: string;
}

const gradientOptions: BackgroundOption[] = [
  {
    id: 'linkedin-blue',
    name: 'LinkedIn Blue',
    type: 'gradient',
    value: 'linear-gradient(to right, #0073b1, #f4a261)'
  },
  {
    id: 'sunset-orange',
    name: 'Sunset Orange',
    type: 'gradient',
    value: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
  },
  {
    id: 'ocean-blue',
    name: 'Ocean Blue',
    type: 'gradient',
    value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  {
    id: 'forest-green',
    name: 'Forest Green',
    type: 'gradient',
    value: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
  },
  {
    id: 'purple-dream',
    name: 'Purple Dream',
    type: 'gradient',
    value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    id: 'fire-red',
    name: 'Fire Red',
    type: 'gradient',
    value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    type: 'gradient',
    value: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
  },
  {
    id: 'midnight-blue',
    name: 'Midnight Blue',
    type: 'gradient',
    value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  {
    id: 'emerald-green',
    name: 'Emerald Green',
    type: 'gradient',
    value: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
  },
  {
    id: 'cosmic-purple',
    name: 'Cosmic Purple',
    type: 'gradient',
    value: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
  },
  {
    id: 'desert-sand',
    name: 'Desert Sand',
    type: 'gradient',
    value: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
  },
  {
    id: 'aurora-borealis',
    name: 'Aurora Borealis',
    type: 'gradient',
    value: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
  },
  {
    id: 'neon-pink',
    name: 'Neon Pink',
    type: 'gradient',
    value: 'linear-gradient(135deg, #ff6b6b 0%, #ffa500 100%)'
  },
  {
    id: 'deep-space',
    name: 'Deep Space',
    type: 'gradient',
    value: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)'
  },
  {
    id: 'sunrise',
    name: 'Sunrise',
    type: 'gradient',
    value: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
  },
  {
    id: 'ocean-depths',
    name: 'Ocean Depths',
    type: 'gradient',
    value: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)'
  }
];

const imageOptions: BackgroundOption[] = [
  {
    id: 'abstract-1',
    name: 'Abstract Waves',
    type: 'image',
    value: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&h=400&fit=crop',
    preview: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=200&h=100&fit=crop'
  },
  {
    id: 'geometric-1',
    name: 'Geometric Pattern',
    type: 'image',
    value: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&h=400&fit=crop',
    preview: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=200&h=100&fit=crop'
  },
  {
    id: 'nature-1',
    name: 'Nature Scene',
    type: 'image',
    value: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop',
    preview: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=100&fit=crop'
  },
  {
    id: 'tech-1',
    name: 'Tech Grid',
    type: 'image',
    value: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop',
    preview: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=200&h=100&fit=crop'
  }
];

interface BackgroundSelectorProps {
  currentBackground: BackgroundOption;
  onBackgroundChange: (background: BackgroundOption) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function BackgroundSelector({ 
  currentBackground, 
  onBackgroundChange, 
  isOpen, 
  onClose 
}: BackgroundSelectorProps) {
  const [activeTab, setActiveTab] = useState<'gradients' | 'images'>('gradients');

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        className="bg-base-100 rounded-xl shadow-2xl border border-base-300 max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-base-300">
          <div className="flex items-center gap-3">
            <Palette className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold text-base-content">Customize Background</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="hover:bg-base-200"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-base-300">
          <button
            onClick={() => setActiveTab('gradients')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'gradients'
                ? 'text-primary border-b-2 border-primary'
                : 'text-base-content/70 hover:text-base-content'
            }`}
          >
            <Sparkles className="w-4 h-4 inline mr-2" />
            Gradients
          </button>
          <button
            onClick={() => setActiveTab('images')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'images'
                ? 'text-primary border-b-2 border-primary'
                : 'text-base-content/70 hover:text-base-content'
            }`}
          >
            <Image className="w-4 h-4 inline mr-2" />
            Images
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === 'gradients' && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {gradientOptions.map((option) => (
                <motion.button
                  key={option.id}
                  onClick={() => onBackgroundChange(option)}
                  className={`relative group rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                    currentBackground.id === option.id
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'border-base-300 hover:border-primary/50'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div
                    className="h-20 w-full"
                    style={{ background: option.value }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                  <div className="p-3 bg-base-100">
                    <p className="text-sm font-medium text-base-content truncate">
                      {option.name}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
          )}

          {activeTab === 'images' && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {imageOptions.map((option) => (
                <motion.button
                  key={option.id}
                  onClick={() => onBackgroundChange(option)}
                  className={`relative group rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                    currentBackground.id === option.id
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'border-base-300 hover:border-primary/50'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="h-20 w-full bg-base-200 flex items-center justify-center">
                    {option.preview ? (
                      <img
                        src={option.preview}
                        alt={option.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Image className="w-8 h-8 text-base-content/50" />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                  <div className="p-3 bg-base-100">
                    <p className="text-sm font-medium text-base-content truncate">
                      {option.name}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-base-300 bg-base-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-base-content/70">
              Current: {currentBackground.name}
            </p>
            <Button onClick={onClose} className="px-6">
              Done
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export { gradientOptions, imageOptions, type BackgroundOption }; 