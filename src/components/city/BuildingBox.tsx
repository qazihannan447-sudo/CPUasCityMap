import React from 'react';
import { cn } from '@/lib/utils';

interface BuildingBoxProps {
  title: string;
  icon: React.ReactNode;
  width: number;
  height: number;
  children: React.ReactNode;
  color: string;
  headerColor: string;
  borderColor: string;
  style?: React.CSSProperties;
  prominent?: boolean;
}

export const BuildingBox = ({
  title,
  icon,
  width,
  height,
  children,
  color,
  headerColor,
  borderColor,
  style,
  prominent
}: BuildingBoxProps) => {
  return (
    <div 
      className={cn(
        "absolute rounded-[10px] border-1.5 overflow-hidden shadow-sm hover:shadow-md transition-shadow",
        borderColor,
        color,
        prominent && "border-2 shadow-md scale-105 z-10"
      )}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        ...style
      }}
    >
      <div className={cn(
        "h-[22px] flex items-center justify-between px-2 text-white",
        headerColor
      )}>
        <span className="text-[10px] font-medium uppercase tracking-wider">{title}</span>
        {icon}
      </div>
      <div className="h-[calc(100%-22px)] p-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
};
