'use client';

import React from 'react';

interface CarSpriteProps {
  color: string;
  size?: 'sm' | 'md';
  label?: string;
  muted?: boolean;
}

export const CarSprite = ({ color, size = 'md', label, muted = false }: CarSpriteProps) => {
  const width = size === 'sm' ? 26 : 34;
  const height = size === 'sm' ? 16 : 20;

  return (
    <div className="relative flex items-center justify-center">
      <svg
        width={width}
        height={height}
        viewBox="0 0 68 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={muted ? 'opacity-45' : 'drop-shadow-[0_6px_10px_rgba(0,0,0,0.28)]'}
      >
        <path d="M17 10C19 6 24 4 29 4H42C47 4 51 6 54 10L60 18C62 20 63 22 63 25V29C63 32 61 34 58 34H10C6 34 4 32 4 28V22C4 18 6 16 10 14L17 10Z" fill={color} />
        <path d="M21 10H49L54 18H16L21 10Z" fill="rgba(255,255,255,0.28)" />
        <rect x="20" y="11" width="10" height="7" rx="2.4" fill="#D9F3FF" opacity="0.95" />
        <rect x="34" y="11" width="12" height="7" rx="2.4" fill="#D9F3FF" opacity="0.95" />
        <circle cx="18" cy="31" r="6" fill="#1F2937" />
        <circle cx="50" cy="31" r="6" fill="#1F2937" />
        <circle cx="18" cy="31" r="2.4" fill="#E5E7EB" />
        <circle cx="50" cy="31" r="2.4" fill="#E5E7EB" />
        <circle cx="10" cy="25" r="2" fill="#FFE89A" />
        <circle cx="58" cy="25" r="2" fill="#FFF3C4" />
        <path d="M11 22H6.5C5.4 22 4.5 22.9 4.5 24V26.2C4.5 27.3 5.4 28.2 6.5 28.2H10.5V22H11Z" fill="rgba(0,0,0,0.08)" />
      </svg>
      {label ? (
        <span className="absolute text-[8px] font-code font-bold text-white tracking-tight drop-shadow-[0_1px_1px_rgba(0,0,0,0.45)]">
          {label}
        </span>
      ) : null}
    </div>
  );
};
