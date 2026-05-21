
'use client';

import React from 'react';
import { Play, StepForward, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useCPUStore } from '@/store/use-cpu-store';

export const BottomBar = () => {
  const { pc, program, step, speed, setSpeed, isAnimating } = useCPUStore();
  const progress = (pc / program.length) * 100;

  return (
    <footer className="h-[52px] border-t border-border bg-panel px-4 flex items-center justify-between z-50 relative">
      {/* Execution Progress Bar */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-border/20">
        <div 
          className="h-full bg-primary transition-all duration-300 shadow-[0_0_4px_rgba(29,158,117,0.5)]" 
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center gap-4">
        <div className="flex flex-col items-center">
          <Button 
            onClick={step}
            disabled={isAnimating || pc >= program.length}
            className="bg-primary hover:bg-primary/90 text-white h-9 px-4 gap-2 arrow-slide-right group transition-transform active:scale-95"
          >
            Step
            <StepForward className="w-4 h-4 arrow-icon" />
          </Button>
          <span className="text-[9px] text-muted-foreground font-medium mt-0.5">→</span>
        </div>
        
        <div className="flex flex-col items-center">
          <Button variant="outline" className="border-primary text-primary hover:bg-primary/5 h-9 px-4 gap-2 active:scale-95">
            <Play className="w-4 h-4 fill-current" />
            Play
          </Button>
          <span className="text-[9px] text-muted-foreground font-medium mt-0.5">Space</span>
        </div>
        
        <div className="h-8 w-px bg-border mx-2" />
        
        <div className="flex items-center gap-4 w-[200px]">
          <span className="text-[11px] font-medium text-dim whitespace-nowrap">{speed}x</span>
          <Slider 
            value={[speed]} 
            onValueChange={(v) => setSpeed(v[0])}
            min={0.5} 
            max={4} 
            step={0.5} 
            className="flex-1" 
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-muted font-medium tracking-tight">Current Program</span>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <ChevronDown className="w-4 h-4 text-muted" />
          </Button>
        </div>
        
        <div className="text-[13px] font-bold text-muted bg-background px-3 py-1 rounded-full border border-border flex items-center gap-2 shadow-sm">
          <span className="text-primary">{pc.toString().padStart(2, '0')}</span>
          <span className="text-dim">/</span>
          <span>{program.length.toString().padStart(2, '0')}</span>
          <span className="text-[9px] text-dim font-bold uppercase tracking-widest ml-1">instr.</span>
        </div>
      </div>
    </footer>
  );
};
