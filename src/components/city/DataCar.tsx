
'use client';

import React, { useEffect, useState } from 'react';
import { CarSprite } from './CarSprite';

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
  const angle = Math.atan2(endPos.y - startPos.y, endPos.x - startPos.x) * (180 / Math.PI);

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
      className="absolute z-[100] transition-all ease-in-out flex items-center justify-center"
      style={{
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        transform: `translate(-50%, -50%) rotate(${angle}deg)`,
        transitionDuration: `${duration}ms`,
        opacity: visible ? 1 : 0,
      }}
    >
      <div className="absolute -top-5 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-1.5 py-0.5 text-[8px] font-code font-bold text-white shadow-md">
        {label}
      </div>
      <CarSprite color={color} label="" />
    </div>
  );
};
