'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export const CityBackdrop = ({ theme }: { theme: 'day' | 'night' }) => {
  return (
    <>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img
          src="/city-backdrop.svg"
          alt=""
          aria-hidden="true"
          className={cn(
            'absolute inset-0 h-full w-full object-cover city-pan-slow',
            theme === 'night' ? 'opacity-40 saturate-[0.75] hue-rotate-[185deg]' : 'opacity-80'
          )}
        />
      </div>

      <div
        aria-hidden="true"
        className={cn(
          'absolute inset-0 pointer-events-none',
          theme === 'night'
            ? 'bg-[radial-gradient(circle_at_top,_rgba(23,37,84,0.25),_transparent_36%),linear-gradient(180deg,rgba(10,20,30,0.28),rgba(10,15,20,0.04)_28%,rgba(5,8,12,0.22))]'
            : 'bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.55),_transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0)_30%,rgba(214,232,201,0.1))]'
        )}
      />

      <div aria-hidden="true" className="absolute inset-x-10 top-10 z-[4] flex justify-between pointer-events-none">
        <div className="city-cloud cloud-left" />
        <div className="city-cloud cloud-right" />
      </div>
    </>
  );
};
