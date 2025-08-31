import React from 'react';
import { motion } from 'framer-motion';
import { SpotlightCard } from '@/components/blocks/SpotlightCard';

interface DashboardCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'gradient' | 'elevated';
  hoverEffect?: boolean;
  onClick?: () => void;
  delay?: number;
}

const cardVariants = {
  default: 'bg-gradient-to-br from-base-200/80 to-base-100/60 border border-base-300/50',
  gradient: 'bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20',
  elevated: 'bg-gradient-to-br from-base-100 to-base-200 border border-base-300 shadow-lg'
};

export const DashboardCard: React.FC<DashboardCardProps> = ({
  children,
  className = '',
  variant = 'default',
  hoverEffect = true,
  onClick,
  delay = 0
}) => {
  const baseClasses = `rounded-xl shadow-md backdrop-blur-sm ${cardVariants[variant]}`;
  const combinedClasses = `${baseClasses} ${className}`;

  const MotionWrapper = motion(SpotlightCard);

  return (
    <MotionWrapper
      className={combinedClasses}
      whileHover={hoverEffect ? { 
        scale: 1.02, 
        y: -2, 
        boxShadow: '0 4px 16px 0 rgba(0,0,0,0.12)' 
      } : {}}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div onClick={onClick}>
        {children}
      </div>
    </MotionWrapper>
  );
};
