'use client';

import React, { useEffect, useRef } from 'react';
import { CITY_ROADS, CITY_VIEWPORT } from '@/config/buildings';

export const CityCanvas = ({ theme }: { theme: 'day' | 'night' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    let frameId = 0;
    let dashOffset = 0;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = CITY_VIEWPORT.width * dpr;
      canvas.height = CITY_VIEWPORT.height * dpr;
      canvas.style.width = `${CITY_VIEWPORT.width}px`;
      canvas.style.height = `${CITY_VIEWPORT.height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      const background = theme === 'night' ? '#241F1A' : '#FAF7F2';
      const blockLine = theme === 'night' ? '#3D362E' : '#E5E0D5';
      const roadFill = theme === 'night' ? '#4A4138' : '#D1C6B5';
      const roadStripe = theme === 'night' ? '#B7AE9E' : '#F8F2E7';

      context.clearRect(0, 0, CITY_VIEWPORT.width, CITY_VIEWPORT.height);
      context.fillStyle = background;
      context.fillRect(0, 0, CITY_VIEWPORT.width, CITY_VIEWPORT.height);

      context.save();
      context.strokeStyle = blockLine;
      context.lineWidth = 1;
      context.globalAlpha = 0.9;
      for (let x = 0; x <= CITY_VIEWPORT.width; x += 50) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, CITY_VIEWPORT.height);
        context.stroke();
      }
      for (let y = 0; y <= CITY_VIEWPORT.height; y += 50) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(CITY_VIEWPORT.width, y);
        context.stroke();
      }
      context.restore();

      CITY_ROADS.forEach((road) => {
        context.save();
        context.strokeStyle = roadFill;
        context.lineWidth = 16;
        context.lineCap = 'round';
        context.beginPath();
        context.moveTo(road.from.x, road.from.y);
        context.lineTo(road.to.x, road.to.y);
        context.stroke();

        context.strokeStyle = roadStripe;
        context.lineWidth = 2;
        context.setLineDash([8, 8]);
        context.lineDashOffset = -dashOffset;
        context.beginPath();
        context.moveTo(road.from.x, road.from.y);
        context.lineTo(road.to.x, road.to.y);
        context.stroke();
        context.restore();
      });

      dashOffset = (dashOffset + 0.5) % 16;
      frameId = window.requestAnimationFrame(draw);
    };

    resizeCanvas();
    draw();

    window.addEventListener('resize', resizeCanvas);
    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [theme]);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" aria-hidden="true" />;
};
