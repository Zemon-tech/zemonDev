import React from 'react';

interface GradientTextProps {
  text: string;
  className?: string;
  gradient?: string;
}

export const GradientText: React.FC<GradientTextProps> = ({ 
  text, 
  className = '', 
  gradient = 'from-primary to-accent' 
}) => {
  return (
    <span className={`bg-gradient-to-r ${gradient} bg-clip-text text-transparent ${className}`}>
      {text}
    </span>
  );
}; 