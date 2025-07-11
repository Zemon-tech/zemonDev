import React, { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

interface CountUpProps {
  from?: number;
  to: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export const CountUp: React.FC<CountUpProps> = ({
  from = 0,
  to,
  duration = 1,
  className = '',
  prefix = '',
  suffix = ''
}) => {
  const [count, setCount] = useState(from);
  const springValue = useSpring(from, {
    duration: duration * 1000,
    bounce: 0,
  });

  useEffect(() => {
    springValue.set(to);
    const unsubscribe = springValue.onChange(setCount);
    return unsubscribe;
  }, [to, springValue]);

  return (
    <motion.span className={className}>
      {prefix}
      {Math.round(count)}
      {suffix}
    </motion.span>
  );
}; 