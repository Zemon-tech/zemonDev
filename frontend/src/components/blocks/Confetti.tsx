import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
  delay: number;
}

interface ConfettiProps {
  isActive?: boolean;
  duration?: number;
  className?: string;
}

const colors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
];

export const Confetti: React.FC<ConfettiProps> = ({ 
  isActive = false, 
  duration = 3000, 
  className = '' 
}) => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (isActive) {
      const newPieces: ConfettiPiece[] = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: -10,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        rotation: Math.random() * 360,
        delay: Math.random() * 0.5
      }));
      
      setPieces(newPieces);
      
      const timer = setTimeout(() => {
        setPieces([]);
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [isActive, duration]);

  if (!isActive) return null;

  return (
    <div className={`fixed inset-0 pointer-events-none z-50 ${className}`}>
      {pieces.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute"
          style={{
            left: `${piece.x}%`,
            top: `${piece.y}%`,
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.color,
            borderRadius: '50%'
          }}
          initial={{ 
            y: -10, 
            x: piece.x, 
            rotate: piece.rotation,
            opacity: 1 
          }}
          animate={{ 
            y: '100vh', 
            x: piece.x + (Math.random() - 0.5) * 20,
            rotate: piece.rotation + 360,
            opacity: [1, 1, 0]
          }}
          transition={{ 
            duration: 3,
            delay: piece.delay,
            ease: 'easeOut'
          }}
        />
      ))}
    </div>
  );
}; 