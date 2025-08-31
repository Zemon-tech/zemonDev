import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { DashboardCard } from './DashboardCard';

interface StatCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  color: string;
  bgGradient: string;
  borderColor: string;
  isProgress?: boolean;
  progressValue?: number;
  delay?: number;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  value,
  label,
  color,
  bgGradient,
  borderColor,
  isProgress = false,
  progressValue = 0,
  delay = 0,
  onClick
}) => {
  return (
    <DashboardCard
      variant="default"
      hoverEffect={true}
      onClick={onClick}
      delay={delay}
      className={`p-4 ${bgGradient} border ${borderColor} h-24 flex items-center justify-center`}
    >
      <div className="flex flex-col items-center justify-center text-center gap-2">
        <motion.div
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.6 }}
          className={color}
        >
          <Icon className="w-5 h-5" />
        </motion.div>
        
        {isProgress ? (
          <div className="relative">
            <div className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center">
              <span className="text-xs font-bold">{progressValue}%</span>
            </div>
          </div>
        ) : (
          <span className={`text-lg font-bold ${color}`}>
            {typeof value === 'number' ? (
              <AnimatedCount value={value} />
            ) : (
              value
            )}
          </span>
        )}
        
        <span className="text-xs text-base-content/80 font-medium">{label}</span>
      </div>
    </DashboardCard>
  );
};

// AnimatedCount utility component
function AnimatedCount({ value, duration = 1.2 }: { value: number; duration?: number }) {
  const safeValue = isNaN(value) || !isFinite(value) ? 0 : Math.max(0, value);
  const [display, setDisplay] = React.useState(0);
  
  React.useEffect(() => {
    let start = 0;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / (duration * 1000), 1);
      setDisplay(Math.floor(progress * safeValue));
      if (progress < 1) requestAnimationFrame(step);
      else setDisplay(safeValue);
    };
    requestAnimationFrame(step);
  }, [safeValue, duration]);
  
  return <span>{display}</span>;
}
