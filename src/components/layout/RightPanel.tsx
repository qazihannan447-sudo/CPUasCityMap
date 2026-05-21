'use client';

import React, { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useCPUStore } from '@/store/use-cpu-store';

export const RightPanel = () => {
  const { registers, stack, memory, activeBuildings } = useCPUStore();
  const [lastModified, setLastModified] = useState<Record<string, 'write' | 'read' | null>>({});

  useEffect(() => {
    const mods: any = {};
    Object.entries(activeBuildings).forEach(([id, status]) => {
      if (status === 'dest') mods[id] = 'write';
      if (status === 'source') mods[id] = 'read';
    });
    if (Object.keys(mods).length > 0) {
      setLastModified(prev => ({ ...prev, ...mods }));
      const timer = setTimeout(() => setLastModified({}), 2000);
      return () => clearTimeout(timer);
    }
  }, [activeBuildings]);

  const Sparkline = () => (
    <div className="flex items-end gap-[1px] h-3 w-10 opacity-30">
      {[40, 70, 30, 90, 50].map((h, i) => (
        <div key={i} className="bg-primary/60 w-1.5" style={{ height: `${h}%` }} />
      ))}
    </div>
  );

  return (
    <aside className="w-[280px] h-full bg-panel border-l border-border flex flex-col p-4 gap-6 transition-colors duration-500">
      <section>
        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-dim mb-3">State: Registers</h2>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(registers).slice(0, 6).map(([id, value]) => (
            <div 
              key={id}
              className={cn(
                "p-2.5 rounded-lg border bg-background/30 flex flex-col gap-2 transition-all duration-300 relative overflow-hidden shadow-sm",
                activeBuildings[id] === 'dest' ? 'border-primary bg-primary/5' : 'border-border'
              )}
            >
              <div className="flex justify-between items-center">
                <Badge className="bg-secondary text-white border-none h-4 px-1.5 text-[8px] font-bold uppercase tracking-tighter">
                  {id}
                </Badge>
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full shadow-sm transition-colors",
                  lastModified[id] === 'write' ? "bg-emerald-500 animate-pulse" : 
                  lastModified[id] === 'read' ? "bg-blue-500" : "bg-dim/30"
                )} />
              </div>
              
              <span key={value} className={cn(
                "font-code text-[16px] text-center font-bold number-flip-in",
                activeBuildings[id] === 'dest' ? 'text-primary' : 'text-foreground'
              )}>
                {value}
              </span>

              <div className="flex justify-center mt-1">
                <Sparkline />
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="h-px bg-border w-full" />

      <section className="flex-1 flex flex-col overflow-hidden">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-dim">State: Stack</h2>
          <Badge variant="stack" className="text-[9px] h-4 px-1.5 font-bold tracking-tight">SP: {stack.length.toString().padStart(2, '0')}</Badge>
        </div>
        <ScrollArea className="flex-1 border border-border rounded-lg bg-background/20 shadow-inner">
          {stack.length === 0 ? (
            <div className="p-8 text-center text-dim italic text-[11px]">Stack is empty</div>
          ) : (
            <div className="p-2 flex flex-col gap-2">
              {[...stack].reverse().map((val, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-md bg-panel border border-border/40 shadow-sm border-l-4 border-l-stack transition-all animate-in slide-in-from-top-2">
                  <span className="text-[9px] font-bold text-dim font-code tracking-tight">[{stack.length - 1 - i}]</span>
                  <span className="text-[13px] font-code flex-1 text-center font-bold text-stack">{val}</span>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </section>

      <div className="h-px bg-border w-full" />

      <section>
        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-dim mb-3">State: Memory</h2>
        <div className="grid grid-cols-4 gap-2">
          {memory.slice(0, 16).map((val, i) => (
            <div 
              key={i} 
              className="aspect-square flex flex-col items-center justify-center border border-border rounded-lg bg-warning/5 hover:bg-warning/20 transition-all duration-300 group cursor-default shadow-sm hover:shadow-md"
            >
              <span className="text-[8px] text-dim leading-none mb-1 font-bold group-hover:text-warning">[{i}]</span>
              <span key={val} className="text-[12px] font-code font-bold text-warning/80 group-hover:text-warning number-flip-in">{val || '0'}</span>
            </div>
          ))}
        </div>
      </section>
    </aside>
  );
};
