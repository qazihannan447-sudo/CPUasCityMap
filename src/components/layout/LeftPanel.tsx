'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check, ChevronDown, FileCode, Plus, TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCPUStore, SAMPLES } from '@/store/use-cpu-store';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const LINE_HEIGHT = 22;
const EDITOR_PADDING_Y = 14;

export const LeftPanel = () => {
  const {
    instructions,
    pc,
    setProgram,
    rawCode,
    executionLog,
    programErrors,
    lastErrorLine,
  } = useCPUStore();
  const [codeValue, setCodeValue] = useState(rawCode);
  const [scrollTop, setScrollTop] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setCodeValue(rawCode);
  }, [rawCode]);

  const handleCodeChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value;
    setCodeValue(value);
    setProgram(value, { pushHistory: false });
  };

  const handleNewProgram = () => {
    setCodeValue('');
    setProgram('', { pushHistory: true });
  };

  const getLogBorderColor = (instruction: string) => {
    const normalized = instruction.toUpperCase();
    if (normalized.includes('LOAD')) return 'border-l-blue-500';
    if (normalized.includes('ADD') || normalized.includes('SUB') || normalized.includes('MUL')) return 'border-l-primary';
    if (normalized.includes('PUSH') || normalized.includes('POP')) return 'border-l-stack';
    if (normalized.includes('STORE')) return 'border-l-orange-500';
    if (normalized.includes('JUMP')) return 'border-l-warning';
    if (normalized.includes('READ')) return 'border-l-violet-500';
    return 'border-l-border';
  };

  const currentLineIndex = instructions[pc]?.line ?? -1;
  const totalLines = Math.max(codeValue.split('\n').length, 10);
  const lineNumbers = useMemo(() => Array.from({ length: totalLines }, (_, index) => index), [totalLines]);
  const highlightedErrorLines = useMemo(() => {
    const lines = new Set(programErrors.map((error) => error.line));
    if (lastErrorLine !== null) {
      lines.add(lastErrorLine);
    }
    return [...lines];
  }, [lastErrorLine, programErrors]);

  return (
    <aside className="w-[320px] min-h-[780px] bg-panel border-r border-border flex flex-col p-4 gap-4 transition-colors duration-500">
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
                  <DropdownMenuItem
                    key={name}
                    onClick={() => setProgram(code, { pushHistory: true })}
                    className="text-[11px] font-medium gap-2"
                  >
                    <FileCode className="w-3 h-3 text-primary" />
                    {name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center">
            <Button variant="outline" size="sm" onClick={handleNewProgram} className="h-6 px-2 text-[9px] gap-1">
              <Plus className="w-3 h-3" />
              New
            </Button>
          </div>
        </div>

        <div className="relative rounded-lg overflow-hidden border border-[#2A2A2A] bg-[#1C1917] shadow-lg">
          <div className="absolute inset-y-0 left-0 w-11 border-r border-white/10 bg-[#151311] text-[10px] font-code text-[#7F7A6E]">
            <div className="absolute inset-0" style={{ transform: `translateY(-${scrollTop}px)` }}>
              {lineNumbers.map((line) => (
                <div
                  key={line}
                  className={cn(
                    'flex h-[22px] items-center justify-end pr-2 transition-colors',
                    currentLineIndex === line && 'text-primary',
                    highlightedErrorLines.includes(line) && 'text-destructive font-bold'
                  )}
                >
                  {line + 1}
                </div>
              ))}
            </div>
          </div>

          <div className="absolute inset-y-0 left-11 right-0 pointer-events-none">
            <div className="absolute inset-0" style={{ transform: `translateY(-${scrollTop}px)` }}>
              {highlightedErrorLines.map((line) => (
                <div
                  key={`error-${line}`}
                  className="absolute left-0 right-0 h-[22px] bg-destructive/10 border-l-2 border-destructive"
                  style={{ top: `${line * LINE_HEIGHT + EDITOR_PADDING_Y}px` }}
                />
              ))}
              {currentLineIndex !== -1 && (
                <div
                  className="absolute left-0 right-0 h-[22px] bg-primary/20 border-l-2 border-primary transition-all duration-300"
                  style={{ top: `${currentLineIndex * LINE_HEIGHT + EDITOR_PADDING_Y}px` }}
                />
              )}
            </div>
          </div>

          <textarea
            ref={textareaRef}
            value={codeValue}
            onChange={handleCodeChange}
            onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
            placeholder={'# Write your assembly program here\n# Example:\nLOADI R2 5\nLOADI R5 3\nADD R4 R2 R5'}
            className="w-full h-[240px] bg-transparent text-[#E8E3D4] font-code text-[12px] pl-14 pr-4 pt-[14px] pb-[14px] resize-none focus:outline-none leading-[22px] selection:bg-primary/40 relative z-10"
            spellCheck={false}
          />
        </div>

        <div className="flex items-center justify-between text-[10px]">
          <span className={cn('font-medium', programErrors.length > 0 ? 'text-destructive' : 'text-primary')}>
            {programErrors.length > 0 ? `${programErrors.length} syntax issue(s) blocking execution` : 'Program syntax ready'}
          </span>
          {lastErrorLine !== null && programErrors.length === 0 && (
            <span className="text-destructive font-medium">Runtime stopped on line {lastErrorLine + 1}</span>
          )}
        </div>

        {(programErrors.length > 0 || lastErrorLine !== null) && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-[11px]">
            <div className="flex items-center gap-2 font-semibold text-destructive mb-1">
              <TriangleAlert className="w-3.5 h-3.5" />
              Diagnostics
            </div>
            <div className="space-y-1">
              {programErrors.slice(0, 3).map((error) => (
                <div key={`${error.line}-${error.message}`} className="text-destructive/90">
                  Line {error.line + 1}: {error.message}
                </div>
              ))}
              {programErrors.length === 0 && lastErrorLine !== null && (
                <div className="text-destructive/90">Last runtime error originated on line {lastErrorLine + 1}.</div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="relative flex h-[300px] flex-col overflow-hidden">
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
              {[...executionLog].reverse().map((log, index) => (
                <div
                  key={`${log.step}-${index}`}
                  className={cn(
                    'flex items-start gap-4 p-3 text-[12px] border-b border-border/40 border-l-4 transition-colors hover:bg-background/50',
                    getLogBorderColor(log.instruction),
                    log.isError && 'bg-destructive/10 border-l-destructive',
                    log.isComplete && 'bg-primary/5 border-l-primary'
                  )}
                >
                  <span className="font-code text-dim font-bold text-[10px] pt-1">
                    {log.step.toString().padStart(3, '0')}
                  </span>
                  <div className="flex-1">
                    <div className={cn('font-bold text-foreground font-code flex items-center gap-2', log.isComplete && 'text-primary')}>
                      {log.instruction}
                      {!log.isError && <Check className="w-3 h-3 text-primary opacity-50" />}
                    </div>
                    <div className={cn('text-[11px] mt-0.5 italic', log.isComplete ? 'text-primary font-bold' : log.isError ? 'text-destructive font-bold' : 'text-muted-foreground')}>
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
              <div className={cn('w-2.5 h-2.5 rounded shadow-sm border border-black/5', item.color)} />
              <span className="text-[9px] text-muted font-bold uppercase tracking-tight">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};
