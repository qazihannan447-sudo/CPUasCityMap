import React from 'react';
import { Play, StepForward, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

export const BottomBar = ({ 
  currentStep, 
  totalSteps, 
  programName 
}: { 
  currentStep: number, 
  totalSteps: number, 
  programName: string 
}) => {
  return (
    <footer className="h-[52px] border-t border-border bg-panel px-4 flex items-center justify-between z-50">
      <div className="flex items-center gap-4">
        <Button className="bg-primary hover:bg-primary/90 text-white h-9 px-4 gap-2">
          Step
          <StepForward className="w-4 h-4" />
        </Button>
        <Button variant="outline" className="border-primary text-primary hover:bg-primary/5 h-9 px-4 gap-2">
          <Play className="w-4 h-4 fill-current" />
          Play
        </Button>
        
        <div className="h-8 w-px bg-border mx-2" />
        
        <div className="flex items-center gap-4 w-[200px]">
          <span className="text-[11px] font-medium text-dim whitespace-nowrap">0.5x</span>
          <Slider defaultValue={[1]} max={4} step={0.5} className="flex-1" />
          <span className="text-[11px] font-medium text-dim whitespace-nowrap">4x</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-muted">{programName}</span>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <ChevronDown className="w-4 h-4 text-muted" />
          </Button>
        </div>
        
        <div className="text-[13px] font-medium text-muted bg-background px-3 py-1 rounded-full border border-border">
          <span className="text-primary">{currentStep}</span>
          <span className="mx-1 text-dim">/</span>
          <span>{totalSteps}</span>
          <span className="ml-2 text-[11px] text-dim font-normal uppercase">instructions</span>
        </div>
      </div>
    </footer>
  );
};
