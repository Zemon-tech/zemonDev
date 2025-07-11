import React from 'react';

interface FloatingIconProps {
  icon: React.ElementType;
  className?: string;
}

export const FloatingIcon: React.FC<FloatingIconProps> = ({
  icon: Icon,
  className = ''
}) => {
  return (
    <div className={`relative ${className}`}>
      <Icon className="w-full h-full" />
    </div>
  );
}; 