'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { LeftPanel } from '@/components/layout/LeftPanel';
import { RightPanel } from '@/components/layout/RightPanel';
import { CityMap } from '@/components/city/CityMap';
import { BottomBar } from '@/components/layout/BottomBar';
import { Toaster } from '@/components/ui/toaster';
import { generateAssemblyCode } from '@/ai/flows/generate-assembly-code';
import { toast } from '@/hooks/use-toast';
import { useCPUStore } from '@/store/use-cpu-store';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function CPUCity() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const { instructions, pc, setProgram, reset, isPaused, step, awaitingInput, submitInput, rawCode } = useCPUStore();

  // Initialize with default program
  useEffect(() => {
    setProgram(rawCode);
  }, []);

  // Playback Loop
  useEffect(() => {
    let interval: any;
    if (!isPaused && pc < instructions.length && pc !== -1) {
      interval = setInterval(() => {
        step();
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isPaused, step, pc, instructions.length]);

  const handleAiArchitect = async () => {
    try {
      setIsGenerating(true);
      const res = await generateAssemblyCode({ 
        description: "Draft a program to multiply R1 by 2 and store it in MEM[5]" 
      });
      if (res.assemblyCode) {
        setProgram(res.assemblyCode);
        toast({
          title: "Blueprint Updated",
          description: "AI Architect has drafted a new algorithm.",
        });
      }
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Architectural Failure",
        description: "Failed to generate code snippet.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const currentInstruction = instructions[pc]?.raw || (pc === -1 ? "HALTED" : "IDLE");

  return (
    <div className="flex flex-col h-screen overflow-hidden selection:bg-primary/20 transition-colors duration-500">
      <Header 
        currentInstruction={currentInstruction} 
        onReset={reset}
      />
      
      <main className="flex-1 flex overflow-hidden">
        <LeftPanel 
          onAiGenerate={handleAiArchitect}
        />
        
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

      {isGenerating && (
        <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-border p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <div className="text-center">
              <h3 className="text-lg font-semibold">AI Architect at Work</h3>
              <p className="text-sm text-dim">Drafting blueprints for your city's CPU...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
