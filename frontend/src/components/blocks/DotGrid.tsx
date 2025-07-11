import React from 'react';

interface DotGridProps {
  className?: string;
}

export const DotGrid: React.FC<DotGridProps> = ({ className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-0" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        opacity: 0.1
      }} />
    </div>
  );
}; 