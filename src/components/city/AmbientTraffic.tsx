'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { CarSprite } from './CarSprite';

interface AmbientRoute {
  start: { x: number; y: number };
  end: { x: number; y: number };
  duration: number;
  delay: number;
  color: string;
}

const ROUTES: AmbientRoute[] = [
  { start: { x: 120, y: 300 }, end: { x: 700, y: 300 }, duration: 9.5, delay: 0, color: '#F59E0B' },
  { start: { x: 120, y: 450 }, end: { x: 700, y: 450 }, duration: 10.8, delay: 1.8, color: '#0EA5E9' },
  { start: { x: 400, y: 120 }, end: { x: 400, y: 610 }, duration: 11.6, delay: 0.6, color: '#10B981' },
  { start: { x: 600, y: 130 }, end: { x: 600, y: 590 }, duration: 12.4, delay: 2.2, color: '#EC4899' },
];

export const AmbientTraffic = () => {
  return (
    <>
      {ROUTES.map((route, index) => (
        <AmbientCar key={`${route.color}-${index}`} route={route} />
      ))}
    </>
  );
};

const AmbientCar = ({ route }: { route: AmbientRoute }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frameId = 0;
    let startTime = 0;

    const step = (timestamp: number) => {
      if (startTime === 0) {
        startTime = timestamp;
      }

      const elapsed = Math.max(0, (timestamp - startTime) / 1000 - route.delay);
      const normalized = ((elapsed / route.duration) % 1 + 1) % 1;
      setProgress(normalized);
      frameId = window.requestAnimationFrame(step);
    };

    frameId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(frameId);
  }, [route.delay, route.duration]);

  const angle = useMemo(
    () => Math.atan2(route.end.y - route.start.y, route.end.x - route.start.x) * (180 / Math.PI),
    [route.end.x, route.end.y, route.start.x, route.start.y]
  );

  const x = route.start.x + (route.end.x - route.start.x) * progress;
  const y = route.start.y + (route.end.y - route.start.y) * progress;

  return (
    <div
      className="absolute z-[18] pointer-events-none"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: `translate(-50%, -50%) rotate(${angle}deg)`,
      }}
    >
      <CarSprite color={route.color} size="sm" muted />
    </div>
  );
};
