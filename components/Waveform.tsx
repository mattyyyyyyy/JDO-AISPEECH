import React, { useEffect, useRef } from 'react';

interface WaveformProps {
  isAnimating: boolean;
  color?: string;
}

const Waveform: React.FC<WaveformProps> = ({ isAnimating, color = '#3b82f6' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let offset = 0;

    const draw = () => {
      if (!canvas) return;
      const width = canvas.width;
      const height = canvas.height;
      
      ctx.clearRect(0, 0, width, height);
      ctx.lineWidth = 2;
      ctx.strokeStyle = color;
      ctx.beginPath();

      const sliceWidth = width * 1.0 / 50;
      let x = 0;

      for (let i = 0; i < 51; i++) {
        const v = isAnimating 
          ? Math.sin((i + offset) * 0.5) * (Math.random() * 20 + 5) 
          : 2;
        
        const y = height / 2 + v;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, height / 2);
      ctx.stroke();

      if (isAnimating) {
        offset += 0.5;
        animationId = requestAnimationFrame(draw);
      } else {
        // Draw flat line
        ctx.clearRect(0, 0, width, height);
        ctx.beginPath();
        ctx.moveTo(0, height/2);
        ctx.lineTo(width, height/2);
        ctx.stroke();
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isAnimating, color]);

  return (
    <canvas 
      ref={canvasRef} 
      width={600} 
      height={100} 
      className="w-full h-24 rounded-xl"
    />
  );
};

export default Waveform;