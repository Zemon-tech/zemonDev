import React from 'react';

interface MinusIconProps {
  className?: string;
}

export const MinusIcon: React.FC<MinusIconProps> = ({ className = "w-4 h-4" }) => {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <line x1="3" y1="12" x2="21" y2="12" />
    </svg>
  );
};
