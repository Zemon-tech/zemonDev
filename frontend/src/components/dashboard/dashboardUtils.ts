// Common dashboard utility functions and constants

// Stat card configurations
export const STAT_CARD_CONFIGS = {
  streak: {
    icon: 'Flame',
    color: 'text-orange-500',
    bgGradient: 'from-orange-500/10 to-red-500/10',
    borderColor: 'border-orange-500/20'
  },
  problems: {
    icon: 'Code',
    color: 'text-blue-500',
    bgGradient: 'from-blue-500/10 to-cyan-500/10',
    borderColor: 'border-blue-500/20'
  },
  points: {
    icon: 'Star',
    color: 'text-purple-500',
    bgGradient: 'from-purple-500/10 to-pink-500/10',
    borderColor: 'border-purple-500/20'
  },
  score: {
    icon: 'Trophy',
    color: 'text-yellow-500',
    bgGradient: 'from-yellow-500/10 to-orange-500/10',
    borderColor: 'border-yellow-500/20'
  }
};

// Animation presets for consistent motion
export const ANIMATION_PRESETS = {
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  },
  fadeInLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.5 }
  },
  fadeInRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.5 }
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.3 }
  },
  stagger: (delay: number = 0.1) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay }
  })
};

// Hover effects for interactive elements
export const HOVER_EFFECTS = {
  card: {
    scale: 1.02,
    y: -2,
    boxShadow: '0 4px 16px 0 rgba(0,0,0,0.12)'
  },
  button: {
    scale: 1.05,
    y: -1
  },
  icon: {
    rotate: 360
  }
};

// Common gradient patterns
export const GRADIENT_PATTERNS = {
  primary: 'bg-gradient-to-br from-primary/10 to-accent/10',
  secondary: 'bg-gradient-to-br from-secondary/10 to-base-200/60',
  success: 'bg-gradient-to-br from-success/10 to-accent/10',
  warning: 'bg-gradient-to-br from-warning/10 to-orange-500/10',
  info: 'bg-gradient-to-br from-info/10 to-blue-500/10',
  default: 'bg-gradient-to-br from-base-200/80 to-base-100/60'
};

// Badge color mappings
export const BADGE_COLORS = {
  primary: 'badge-primary',
  secondary: 'badge-secondary',
  accent: 'badge-accent',
  success: 'badge-success',
  warning: 'badge-warning',
  error: 'badge-error',
  info: 'badge-info',
  neutral: 'badge-neutral'
};

// Utility functions
export const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

export const getPercentageColor = (percentage: number): string => {
  if (percentage >= 80) return 'text-success';
  if (percentage >= 60) return 'text-warning';
  if (percentage >= 40) return 'text-info';
  return 'text-error';
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

// Mock data for development/testing
export const MOCK_DATA = {
  leaderboard: [
    { name: 'Aarav Sharma', points: 1200, rank: 1, avatar: 'https://randomuser.me/api/portraits/men/32.jpg', streak: 15 },
    { name: 'Priya Patel', points: 1100, rank: 2, avatar: 'https://randomuser.me/api/portraits/women/44.jpg', streak: 12 },
    { name: 'Rahul Kumar', points: 1050, rank: 3, avatar: 'https://randomuser.me/api/portraits/men/45.jpg', streak: 8 }
  ],
  showcase: [
    {
      title: 'Distributed Cache System',
      author: 'Aarav Sharma',
      upvotes: 42,
      stack: ['Redis', 'Node.js', 'Docker'],
      description: 'High-performance caching solution with Redis cluster',
      color: 'from-blue-500/20 to-cyan-500/20'
    },
    {
      title: 'ML Pipeline Automation',
      author: 'Priya Patel',
      upvotes: 35,
      stack: ['Python', 'TensorFlow', 'AWS'],
      description: 'Automated machine learning workflow pipeline',
      color: 'from-purple-500/20 to-pink-500/20'
    }
  ]
};
