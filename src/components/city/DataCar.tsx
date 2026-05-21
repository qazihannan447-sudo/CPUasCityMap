
'use client';

import React, { useEffect, useState } from 'react';

interface DataCarProps {
  startPos: { x: number; y: number };
  endPos: { x: number; y: number };
  color: string;
  label: string;
  duration: number;
}

export const DataCar = ({ startPos, endPos, color, label, duration }: DataCarProps) => {
  const [pos, setPos] = useState(startPos);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Small delay to trigger transition
    const timer = setTimeout(() => {
      setPos(endPos);
      setVisible(true);
    }, 50);

    return () => clearTimeout(timer);
  }, [endPos]);

  return (
    <div
      className="absolute z-[100] transition-all ease-in-out flex items-center justify-center rounded-full shadow-lg border-2 border-white/20"
      style={{
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        width: '24px',
        height: '24px',
        backgroundColor: color,
        transform: 'translate(-50%, -50%)',
        transitionDuration: `${duration}ms`,
        opacity: visible ? 1 : 0,
      }}
    >
      <span className="text-[9px] font-code font-bold text-white">{label}</span>
    </div>
  );
};
