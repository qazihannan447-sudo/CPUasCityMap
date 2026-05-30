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
  titleClassName?: string;
  contentClassName?: string;
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
  prominent,
  titleClassName,
  contentClassName,
}: BuildingBoxProps) => {
  const { activeBuildings } = useCPUStore();
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
              status === 'dest' && "pulse-dest",
              status === 'error' && "shake-anim border-destructive bg-destructive/10"
            )}
            style={{
              width: `${width}px`,
              height: `${height}px`,
              ...style
            }}
          >
            <div className={cn(
              "h-[24px] flex items-center justify-between px-2 text-white relative",
              headerColor,
              prominent && status === 'dest' && "alu-sweep"
            )}>
              <span className={cn("text-[10px] font-medium uppercase tracking-wider flex items-center gap-1.5 z-10", titleClassName)}>
                {icon}
                {title}
              </span>
              {/* Window grid for night mode */}
              <div className="flex gap-1">
                <div className="w-1 h-1 rounded-sm bg-white/20 building-window" />
                <div className="w-1 h-1 rounded-sm bg-white/20 building-window" />
              </div>
            </div>
            <div className={cn("h-[calc(100%-24px)] p-1 overflow-hidden bg-white/20 backdrop-blur-[1px]", contentClassName)}>
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
