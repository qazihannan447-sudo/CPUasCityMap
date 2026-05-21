import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface RegisterState {
  id: string;
  value: string;
  active?: boolean;
}

export const RightPanel = ({ 
  registers, 
  stack, 
  memory 
}: { 
  registers: RegisterState[], 
  stack: string[], 
  memory: (string | null)[] 
}) => {
  const Sparkline = () => (
    <div className="flex items-end gap-[1px] h-4 w-12 opacity-40">
      {[40, 70, 30, 90, 50].map((h, i) => (
        <div key={i} className="bg-primary/60 w-1.5" style={{ height: `${h}%` }} />
      ))}
    </div>
  );

  return (
    <aside className="w-[260px] h-[calc(100vh-48px-52px)] bg-panel border-l border-border flex flex-col">
      <div className="p-4 flex flex-col gap-6 overflow-hidden h-full">
        
        <section>
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-dim mb-3">State: Registers</h2>
          <div className="grid grid-cols-2 gap-3">
            {registers.map((reg) => (
              <div 
                key={reg.id}
                className={cn(
                  "p-2.5 rounded-lg border bg-background/30 flex flex-col gap-2 transition-all duration-300 relative overflow-hidden",
                  reg.active ? 'border-primary shadow-md bg-primary/5' : 'border-border'
                )}
              >
                <div className="flex justify-between items-center">
                  <Badge className="bg-secondary/10 text-secondary border-none h-4 px-1.5 text-[8px] font-bold uppercase tracking-tighter">
                    {reg.id}
                  </Badge>
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full shadow-sm",
                    reg.active ? "bg-emerald-500 animate-pulse" : "bg-dim/30"
                  )} />
                </div>
                
                <span className={cn(
                  "font-code text-[16px] text-center font-bold",
                  reg.active ? 'text-primary' : 'text-foreground'
                )}>
                  {reg.value || '0'}
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
                  <div key={i} className="flex items-center gap-3 p-2 rounded-md bg-panel border border-border/40 shadow-sm border-l-4 border-l-stack transition-all hover:translate-x-1">
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
                <span className="text-[12px] font-code font-bold text-warning/80 group-hover:text-warning">{val || '0'}</span>
              </div>
            ))}
          </div>
        </section>

      </div>
    </aside>
  );
};
