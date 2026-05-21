
'use client';

import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { LeftPanel } from '@/components/layout/LeftPanel';
import { RightPanel } from '@/components/layout/RightPanel';
import { CityMap } from '@/components/city/CityMap';
import { BottomBar } from '@/components/layout/BottomBar';
import { Toaster } from '@/components/ui/toaster';
import { generateAssemblyCode } from '@/ai/flows/generate-assembly-code';
import { toast } from '@/hooks/use-toast';
import { useCPUStore } from '@/store/use-cpu-store';

export default function CPUCity() {
  const [isGenerating, setIsGenerating] = useState(false);
  const { program, pc, setProgram, reset } = useCPUStore();

  const handleAiArchitect = async () => {
    try {
      setIsGenerating(true);
      const res = await generateAssemblyCode({ 
        description: "Calculate the sum of numbers from 1 to 5 and store the result in memory address [4]" 
      });
      if (res.assemblyCode) {
        setProgram(res.assemblyCode);
        toast({
          title: "Architecture Updated",
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

  const currentInstruction = program[pc] || "HLT";

  return (
    <div className="flex flex-col h-screen overflow-hidden selection:bg-primary/20">
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

      {isGenerating && (
        <div className="fixed inset-0 z-[100] bg-panel/80 flex items-center justify-center backdrop-blur-sm animate-in fade-in">
          <div className="bg-panel border border-border p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4">
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
