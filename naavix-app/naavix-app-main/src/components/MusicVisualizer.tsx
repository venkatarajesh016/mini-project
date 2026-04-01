import React, { useEffect, useRef } from 'react';
import { usePlayer } from '@/context/PlayerContext';

const MusicVisualizer: React.FC = () => {
  const { isPlaying, isVisualizerOn } = usePlayer();
  const barsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (!isPlaying || !isVisualizerOn) return;

    const animateBars = () => {
      barsRef.current.forEach((bar) => {
        if (bar) {
          const height = Math.random() * 100;
          bar.style.height = `${Math.max(20, height)}%`;
        }
      });
    };

    const interval = setInterval(animateBars, 100);
    return () => clearInterval(interval);
  }, [isPlaying, isVisualizerOn]);

  if (!isVisualizerOn) return null;

  return (
    <div className="flex items-end gap-[2px] h-8">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          ref={(el) => {
            if (el) barsRef.current[i] = el;
          }}
          className="w-1 rounded-full transition-all duration-100"
          style={{
            height: isPlaying ? `${20 + Math.random() * 80}%` : '20%',
            background: 'linear-gradient(to top, hsl(32, 95%, 55%), hsl(322, 93%, 53%), hsl(270, 70%, 45%))',
          }}
        />
      ))}
    </div>
  );
};

export default MusicVisualizer;
