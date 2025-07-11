import React, { useEffect, useRef } from 'react';
import { useTheme } from '@/lib/ThemeContext';

interface BrainWavesProps {
  className?: string;
}

export const BrainWaves: React.FC<BrainWavesProps> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const nodes: Array<{
      x: number;
      y: number;
      connections: number[];
    }> = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createNode = (x: number, y: number) => {
      return {
        x,
        y,
        connections: []
      };
    };

    const init = () => {
      resize();
      // Create a grid of nodes
      const spacing = 100;
      for (let x = spacing; x < canvas.width - spacing; x += spacing) {
        for (let y = spacing; y < canvas.height - spacing; y += spacing) {
          const node = createNode(
            x + (Math.random() - 0.5) * spacing * 0.5,
            y + (Math.random() - 0.5) * spacing * 0.5
          );
          nodes.push(node);
        }
      }

      // Create connections
      nodes.forEach((node, i) => {
        for (let j = i + 1; j < nodes.length; j++) {
          const otherNode = nodes[j];
          const distance = Math.hypot(node.x - otherNode.x, node.y - otherNode.y);
          if (distance < spacing * 1.5) {
            node.connections.push(j);
          }
        }
      });
    };

    const drawNode = (x: number, y: number, time: number) => {
      const radius = 2 + Math.sin(time * 0.002 + x * 0.1) * 1;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = theme === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.3)';
      ctx.fill();
    };

    const drawConnection = (x1: number, y1: number, x2: number, y2: number, time: number) => {
      const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
      const alpha = Math.sin(time * 0.002 + x1 * 0.01) * 0.2 + 0.2;
      
      if (theme === 'dark') {
        gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
        gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);
      } else {
        gradient.addColorStop(0, `rgba(0, 0, 0, ${alpha})`);
        gradient.addColorStop(1, `rgba(0, 0, 0, 0)`);
      }

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 1;
      ctx.stroke();
    };

    const animate = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      nodes.forEach((node, i) => {
        drawNode(node.x, node.y, time + i * 100);
        node.connections.forEach(j => {
          const otherNode = nodes[j];
          drawConnection(node.x, node.y, otherNode.x, otherNode.y, time + i * 100);
        });
      });

      requestAnimationFrame(animate);
    };

    init();
    animate(0);

    window.addEventListener('resize', init);

    return () => {
      window.removeEventListener('resize', init);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none ${className}`}
    />
  );
}; 