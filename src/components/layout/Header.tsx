'use client';

import React from 'react';
import { Building2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCPUStore } from '@/store/use-cpu-store';
import { cn } from '@/lib/utils';

export const Header = ({ 
  currentInstruction,
  onReset
}: { 
  currentInstruction?: string,
  onReset: () => void
}) => {
  const { isRunning, isPaused, pc } = useCPUStore();
  const status =
    isRunning && !isPaused ? 'RUNNING' :
    isRunning && isPaused  ? 'PAUSED'  :
    pc === -1              ? 'HALTED'  :
    pc > 0                 ? 'PAUSED'  :
    'IDLE';

  const statusDotClass =
    status === 'RUNNING' ? "bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" :
    status === 'PAUSED'  ? "bg-amber-400" :
    status === 'HALTED'  ? "bg-red-500" :
    "bg-dim";

  return (
    <header className="h-[48px] border-b border-border bg-panel px-4 flex items-center justify-between z-50">
      <div className="flex items-center gap-2 group cursor-default">
        <div className="bg-primary p-1.5 rounded shadow-sm group-hover:scale-110 transition-transform">
          <Building2 className="w-4 h-4 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-[16px] font-bold tracking-tight leading-none">CPU City</span>
          <div className="h-[2px] w-4 bg-primary rounded-full mt-1 group-hover:w-full transition-all duration-300" />
        </div>
      </div>

      <div className="flex-1 flex justify-center">
        {currentInstruction && (
          <div className="bg-background border border-border px-4 py-1.5 rounded-lg shadow-sm flex items-center gap-3">
            <div className="relative">
              <div className={cn(
                "w-2 h-2 rounded-full transition-colors",
                statusDotClass
              )} />
              {status === 'RUNNING' && <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-500 animate-ping opacity-75" />}
            </div>
            <code className="text-[13px] font-code font-bold text-foreground">
              {currentInstruction}
            </code>
            <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-dim">
              {status}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button 
          onClick={onReset}
          variant="outline" 
          size="sm" 
          className="h-8 border-destructive/20 text-destructive hover:bg-destructive/5 font-medium gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </Button>
      </div>
    </header>
  );
};
