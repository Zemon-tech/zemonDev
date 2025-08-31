import React from 'react';
import { motion } from 'framer-motion';

interface LoadingSkeletonProps {
  variant?: 'card' | 'stat' | 'list' | 'text';
  className?: string;
  lines?: number;
  height?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  variant = 'card',
  className = '',
  lines = 3,
  height = 'h-4'
}) => {
  const baseClasses = 'bg-base-300/50 rounded animate-pulse';
  
  if (variant === 'card') {
    return (
      <div className={`${baseClasses} ${className}`}>
        <div className="p-4 space-y-3">
          <div className="h-4 bg-base-300/70 rounded w-3/4" />
          <div className="h-3 bg-base-300/70 rounded w-1/2" />
          <div className="h-3 bg-base-300/70 rounded w-2/3" />
        </div>
      </div>
    );
  }
  
  if (variant === 'stat') {
    return (
      <div className={`${baseClasses} ${className} p-4 h-24 flex flex-col items-center justify-center space-y-2`}>
        <div className="w-5 h-5 bg-base-300/70 rounded-full" />
        <div className="w-8 h-4 bg-base-300/70 rounded" />
        <div className="w-16 h-3 bg-base-300/70 rounded" />
      </div>
    );
  }
  
  if (variant === 'list') {
    return (
      <div className={`${baseClasses} ${className}`}>
        <div className="p-4 space-y-2">
          {Array.from({ length: lines }).map((_, i) => (
            <motion.div
              key={i}
              className={`${height} bg-base-300/70 rounded`}
              style={{ width: `${Math.random() * 40 + 60}%` }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.1 }}
            />
          ))}
        </div>
      </div>
    );
  }
  
  if (variant === 'text') {
    return (
      <div className={`${baseClasses} ${className}`}>
        <div className="p-2">
          <div className={`${height} bg-base-300/70 rounded w-full`} />
        </div>
      </div>
    );
  }
  
  return null;
};

// Specialized skeleton components for common use cases
export const StatCardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <LoadingSkeleton variant="stat" className={className} />
);

export const CardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <LoadingSkeleton variant="card" className={className} />
);

export const ListSkeleton: React.FC<{ className?: string; lines?: number }> = ({ className, lines }) => (
  <LoadingSkeleton variant="list" className={className} lines={lines} />
);
