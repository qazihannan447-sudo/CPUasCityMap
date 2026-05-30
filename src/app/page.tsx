'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { LeftPanel } from '@/components/layout/LeftPanel';
import { RightPanel } from '@/components/layout/RightPanel';
import { CityMap } from '@/components/city/CityMap';
import { BottomBar } from '@/components/layout/BottomBar';
import { Toaster } from '@/components/ui/toaster';
import { useCPUStore } from '@/store/use-cpu-store';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function CPUCity() {
  const [inputValue, setInputValue] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { instructions, pc, reset, isPaused, step, awaitingInput, submitInput, speed, undo } = useCPUStore();

  // Playback Loop
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!isPaused && pc < instructions.length && pc !== -1) {
      const intervalMs = 2000 / speed;
      intervalRef.current = setInterval(async () => {
        await step();

        const nextPc = useCPUStore.getState().pc;
        const programLength = instructions.length;

        if (nextPc === -1 || nextPc >= programLength) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          useCPUStore.setState({ isRunning: false, isPaused: true });
          return;
        }
      }, intervalMs);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPaused, step, pc, instructions.length, speed]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isEditorTarget = target?.tagName === 'TEXTAREA' || target?.tagName === 'INPUT';
      if (isEditorTarget) return;

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        undo();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [undo]);

  const currentInstruction = instructions[pc]?.raw || (pc === -1 ? "HALTED" : "IDLE");

  return (
    <div className="flex h-screen flex-col overflow-hidden selection:bg-primary/20 transition-colors duration-500">
      <Header 
        currentInstruction={currentInstruction} 
        onReset={reset}
        onUndo={undo}
      />
      
      <main className="flex flex-1 overflow-hidden">
        <LeftPanel />
        
        <CityMap />
        
        <RightPanel />
      </main>

      <BottomBar />
      
      <Toaster />

      {/* READ Input Modal */}
      <Dialog open={!!awaitingInput} onOpenChange={() => {}}>
        <DialogContent className="bg-[#FAF7F2] border-border shadow-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-primary font-bold">Signal Requested</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <p className="text-sm text-muted-foreground">
              The city requires a numeric input to store in <span className="font-code font-bold text-foreground">{awaitingInput?.register}</span>.
            </p>
            <Input 
              type="number" 
              placeholder="Enter value..." 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="border-primary/20 bg-white focus-visible:ring-primary"
            />
            <Button 
              onClick={() => {
                submitInput(parseInt(inputValue) || 0);
                setInputValue('');
              }}
              className="bg-primary hover:bg-primary/90 text-white font-bold"
            >
              Confirm Signal
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
