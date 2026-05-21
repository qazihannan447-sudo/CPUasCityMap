
'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCPUStore } from '@/store/use-cpu-store';

interface BuildingBoxProps {
  id?: string;
  title: string;
  description: string;
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
  id,
  title,
  description,
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
  const activeBuildings = useCPUStore(state => state.activeBuildings);
  const status = id ? activeBuildings[id] : null;

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className={cn(
              "absolute rounded-[10px] border-1.5 overflow-hidden transition-all duration-300 building-shadow",
              borderColor,
              color,
              prominent ? "border-2 shadow-lg scale-105 z-10" : "hover:shadow-md hover:-translate-y-0.5",
              status === 'source' && "pulse-source",
              status === 'dest' && "pulse-dest"
            )}
            style={{
              width: `${width}px`,
              height: `${height}px`,
              ...style
            }}
          >
            <div className={cn(
              "h-[22px] flex items-center justify-between px-2 text-white relative",
              headerColor,
              prominent && "alu-sweep"
            )}>
              <span className="text-[10px] font-medium uppercase tracking-wider flex items-center gap-1.5 z-10">
                {icon}
                {title}
              </span>
            </div>
            <div className="h-[calc(100%-22px)] p-1 overflow-hidden bg-white/20 backdrop-blur-[1px]">
              {children}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-panel border-border shadow-xl p-3 max-w-[200px]">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold uppercase tracking-tight text-foreground">{title}</span>
            <p className="text-[11px] leading-relaxed text-muted-foreground">{description}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
