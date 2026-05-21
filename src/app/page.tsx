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

export default function CPUCity() {
  const [code, setCode] = useState(`MOV R1, 10\nMOV R2, 20\nADD R3, R1, R2\nSTORE R3, [0]\nHLT`);
  const [logs] = useState([
    { step: 1, instruction: 'MOV R1, 10', result: 'R1 = 10' },
    { step: 2, instruction: 'MOV R2, 20', result: 'R2 = 20' },
    { step: 3, instruction: 'ADD R3, R1, R2', result: 'R3 = 30' },
  ]);
  const [isGenerating, setIsGenerating] = useState(false);

  const registers = [
    { id: 'R0', value: '0' },
    { id: 'R1', value: '10' },
    { id: 'R2', value: '20' },
    { id: 'R3', value: '30', active: true },
    { id: 'R4', value: '0' },
    { id: 'R5', value: '0' },
  ];

  const stack = ['7', '12', '42'];
  const memory = ['30', null, null, null, '120', null, null, null, null, null, null, null, null, null, null, null];

  const handleAiArchitect = async () => {
    try {
      setIsGenerating(true);
      const res = await generateAssemblyCode({ 
        description: "Calculate the sum of numbers from 1 to 5 and store the result in memory address [4]" 
      });
      if (res.assemblyCode) {
        setCode(res.assemblyCode);
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

  return (
    <div className="flex flex-col h-screen overflow-hidden selection:bg-primary/20">
      <Header currentInstruction="ADD R1 R2 → R3" />
      
      <main className="flex-1 flex overflow-hidden">
        <LeftPanel 
          code={code} 
          setCode={setCode} 
          logs={logs} 
          onAiGenerate={handleAiArchitect}
        />
        
        <CityMap />
        
        <RightPanel 
          registers={registers} 
          stack={stack} 
          memory={memory} 
        />
      </main>

      <BottomBar 
        currentStep={3} 
        totalSteps={12} 
        programName="Sum two numbers" 
      />
      
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
