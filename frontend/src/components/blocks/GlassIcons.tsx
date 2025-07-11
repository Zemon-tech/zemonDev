import React from 'react';
import { motion } from 'framer-motion';

interface GlassIconProps {
  icon: React.ElementType;
  className?: string;
}

export const GlassIcon: React.FC<GlassIconProps> = ({ icon: Icon, className = '' }) => {
  return (
    <motion.div
      className={`relative p-2 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Icon className="w-full h-full" />
      <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent rounded-lg pointer-events-none" />
    </motion.div>
  );
}; 