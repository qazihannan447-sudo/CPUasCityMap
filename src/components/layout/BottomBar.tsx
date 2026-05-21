'use client';

import React from 'react';
import { Play, Pause, StepForward, ChevronDown, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useCPUStore } from '@/store/use-cpu-store';

export const BottomBar = () => {
  const { pc, instructions, step, speed, setSpeed, isAnimating, isPaused, togglePlay, metrics } = useCPUStore();
  const progress = instructions.length > 0 ? (pc / instructions.length) * 100 : 0;

  return (
    <footer className="h-[72px] border-t border-border bg-panel px-4 flex flex-col z-50 relative">
      {/* Execution Progress Bar */}
      <div className="absolute top-0 left-0 w-full h-[3px] bg-border/20">
        <div 
          className="h-full bg-primary transition-all duration-300 shadow-[0_0_4px_rgba(29,158,117,0.5)]" 
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Metrics Bar */}
      <div className="h-6 flex items-center justify-center gap-6 border-b border-border/40 px-4">
        {[
          { label: 'Executed', val: metrics.instructions },
          { label: 'Reg Writes', val: metrics.regWrites },
          { label: 'Mem Writes', val: metrics.memWrites },
          { label: 'Stack Depth', val: metrics.stackMax },
        ].map(m => (
          <div key={m.label} className="flex items-center gap-1.5 text-[9px] font-bold text-dim uppercase tracking-wider">
            <span>{m.label}:</span>
            <span className="text-primary">{m.val}</span>
          </div>
        ))}
      </div>

      <div className="flex-1 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center">
            <Button 
              onClick={step}
              disabled={isAnimating || !isPaused || pc >= instructions.length}
              className="bg-primary hover:bg-primary/90 text-white h-8 px-4 gap-2 arrow-slide-right group transition-transform active:scale-95"
            >
              Step
              <StepForward className="w-3.5 h-3.5 arrow-icon" />
            </Button>
            <span className="text-[9px] text-muted-foreground font-medium mt-0.5">→</span>
          </div>
          
          <div className="flex flex-col items-center">
            <Button 
              onClick={togglePlay}
              variant="outline" 
              className="border-primary text-primary hover:bg-primary/5 h-8 px-4 gap-2 active:scale-95"
            >
              {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
              {isPaused ? 'Play' : 'Pause'}
            </Button>
            <span className="text-[9px] text-muted-foreground font-medium mt-0.5">Space</span>
          </div>
          
          <div className="h-8 w-px bg-border mx-2" />
          
          <div className="flex items-center gap-4 w-[160px]">
            <span className="text-[10px] font-medium text-dim whitespace-nowrap">{speed}x</span>
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
          <div className="text-[12px] font-bold text-muted bg-background px-3 py-1 rounded-full border border-border flex items-center gap-2 shadow-sm">
            <span className="text-primary">{pc === -1 ? instructions.length : pc.toString().padStart(2, '0')}</span>
            <span className="text-dim">/</span>
            <span>{instructions.length.toString().padStart(2, '0')}</span>
          </div>
          
          <div className="flex items-center gap-2 bg-primary/5 px-2 py-1 rounded-md border border-primary/20">
            <Cpu className="w-3 h-3 text-primary" />
            <span className="text-[9px] font-bold text-primary uppercase tracking-tighter">Built for CA Lab</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
