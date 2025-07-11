import React from 'react';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
}

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`transition-colors duration-300 ${className}`}>
      {children}
    </div>
  );
}; 