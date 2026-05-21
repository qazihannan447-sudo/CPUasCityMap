'use client';

import React, { useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Check, ChevronDown, FileCode } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCPUStore, SAMPLES } from '@/store/use-cpu-store';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';

export const LeftPanel = ({ 
  onAiGenerate 
}: { 
  onAiGenerate: () => void 
}) => {
  const { instructions, pc, setProgram, rawCode, executionLog } = useCPUStore();
  const [codeValue, setCodeValue] = useState(rawCode);

  useEffect(() => {
    setCodeValue(rawCode);
  }, [rawCode]);

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setCodeValue(val);
    setProgram(val);
  };

  const getLogBorderColor = (instruction: string) => {
    const i = instruction.toUpperCase();
    if (i.includes('LOAD')) return 'border-l-blue-500';
    if (i.includes('ADD') || i.includes('SUB') || i.includes('MUL')) return 'border-l-primary';
    if (i.includes('PUSH') || i.includes('POP')) return 'border-l-stack';
    if (i.includes('STORE')) return 'border-l-orange-500';
    if (i.includes('JUMP')) return 'border-l-warning';
    return 'border-l-border';
  };

  const currentLineIndex = instructions[pc]?.line ?? -1;

  return (
    <aside className="w-[300px] h-full bg-panel border-r border-border flex flex-col p-4 gap-4 transition-colors duration-500">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-dim">Blueprint</h2>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 px-1.5 text-[9px] gap-1 text-primary">
                  SAMPLES <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="bg-panel border-border">
                {Object.entries(SAMPLES).map(([name, code]) => (
                  <DropdownMenuItem key={name} onClick={() => setProgram(code)} className="text-[11px] font-medium gap-2">
                    <FileCode className="w-3 h-3 text-primary" />
                    {name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <button 
            onClick={onAiGenerate}
            className="text-[10px] flex items-center gap-1.5 text-primary hover:text-primary/80 font-bold transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI ARCHITECT
          </button>
        </div>
        <div className="relative rounded-lg overflow-hidden border border-[#2A2A2A] bg-[#1C1917] shadow-lg">
          {/* Editor background highlight */}
          {currentLineIndex !== -1 && (
            <div 
              className="absolute left-0 w-full h-[22px] bg-primary/20 pointer-events-none transition-all duration-300 border-l-2 border-primary"
              style={{ top: `${currentLineIndex * 22 + 16}px` }}
            />
          )}
          <textarea
            value={codeValue}
            onChange={handleCodeChange}
            className="w-full h-[220px] bg-transparent text-[#E8E3D4] font-code text-[12px] p-4 resize-none focus:outline-none leading-[22px] selection:bg-primary/40 relative z-10"
            spellCheck={false}
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-dim mb-3">Execution Log</h2>
        
        <div className="absolute top-[28px] left-0 right-0 h-8 bg-gradient-to-b from-panel to-transparent z-10 pointer-events-none opacity-60" />

        <ScrollArea className="flex-1 rounded-lg border border-border bg-background/20 overflow-auto shadow-inner">
          {executionLog.length === 0 ? (
            <div className="p-8 text-center text-dim italic text-[11px] flex flex-col items-center gap-2">
              <div className="w-10 h-[1px] bg-border" />
              No signals captured
              <div className="w-10 h-[1px] bg-border" />
            </div>
          ) : (
            <div className="flex flex-col">
              {[...executionLog].reverse().map((log, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "flex items-start gap-4 p-3 text-[12px] border-b border-border/40 border-l-4 transition-colors hover:bg-background/50",
                    getLogBorderColor(log.instruction),
                    log.isError && "bg-destructive/10 border-l-destructive"
                  )}
                >
                  <span className="font-code text-dim font-bold text-[10px] pt-1">
                    {log.step.toString().padStart(3, '0')}
                  </span>
                  <div className="flex-1">
                    <div className="font-bold text-foreground font-code flex items-center gap-2">
                      {log.instruction}
                      {!log.isError && <Check className="w-3 h-3 text-primary opacity-50" />}
                    </div>
                    <div className={cn("text-[11px] mt-0.5 italic", log.isError ? "text-destructive font-bold" : "text-muted-foreground")}>
                      {log.result}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      <div className="pt-4 border-t border-border">
        <div className="grid grid-cols-2 gap-y-2 gap-x-4">
          {[
            { label: 'Register', color: 'bg-secondary' },
            { label: 'ALU', color: 'bg-primary' },
            { label: 'Memory', color: 'bg-warning' },
            { label: 'Stack', color: 'bg-stack' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div className={cn("w-2.5 h-2.5 rounded shadow-sm border border-black/5", item.color)} />
              <span className="text-[9px] text-muted font-bold uppercase tracking-tight">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};
