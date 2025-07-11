import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

interface TimelineItemProps {
  content: string;
  index: number;
}

const TimelineItem: React.FC<TimelineItemProps> = ({ content, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="flex items-start gap-4 group"
    >
      <div className="relative flex items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.1 + 0.2 }}
          className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"
        >
          <CheckCircle2 className="w-5 h-5 text-primary" />
        </motion.div>
        {index !== 0 && (
          <div className="absolute top-0 -translate-y-full left-1/2 w-0.5 h-full bg-gradient-to-b from-primary/30 to-transparent" />
        )}
      </div>
      <div className="flex-1 relative">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 + 0.1 }}
          className="p-4 rounded-lg bg-base-200/50 backdrop-blur-sm border border-base-300 group-hover:bg-base-200/70 transition-colors"
        >
          <p className="text-base-content/90">{content}</p>
        </motion.div>
      </div>
    </motion.div>
  );
};

interface TimelineProps {
  items: string[];
  className?: string;
}

export const Timeline: React.FC<TimelineProps> = ({ items, className = '' }) => {
  return (
    <div className={`space-y-8 ${className}`}>
      {items.map((item, index) => (
        <TimelineItem key={index} content={item} index={index} />
      ))}
    </div>
  );
}; 