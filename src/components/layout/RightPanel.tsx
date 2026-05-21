import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

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
  return (
    <aside className="w-[260px] h-[calc(100vh-48px-52px)] bg-panel border-l border-border flex flex-col">
      <div className="p-4 flex flex-col gap-6 overflow-hidden h-full">
        
        <section>
          <h2 className="text-[10px] font-medium uppercase tracking-widest text-dim mb-3">Registers</h2>
          <div className="grid grid-cols-2 gap-2">
            {registers.map((reg) => (
              <div 
                key={reg.id}
                className={`p-2 rounded-md border bg-background/50 flex flex-col gap-1 transition-all ${reg.active ? 'border-primary shadow-sm bg-primary/5' : 'border-border'}`}
              >
                <span className={`text-[9px] font-medium uppercase ${reg.active ? 'text-primary' : 'text-dim'}`}>{reg.id}</span>
                <span className={`font-code text-[14px] text-center ${reg.active ? 'text-primary font-semibold' : 'text-foreground'}`}>
                  {reg.value || '—'}
                </span>
              </div>
            ))}
          </div>
        </section>

        <div className="h-px bg-border w-full" />

        <section className="flex-1 flex flex-col overflow-hidden">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-[10px] font-medium uppercase tracking-widest text-dim">Stack</h2>
            <Badge variant="outline" className="text-[9px] h-4 px-1.5 border-stack text-stack bg-stack/5">SP: {stack.length}</Badge>
          </div>
          <ScrollArea className="flex-1 border border-border rounded-md bg-background/30">
            {stack.length === 0 ? (
              <div className="p-8 text-center text-dim italic text-[11px]">Stack is empty</div>
            ) : (
              <div className="p-2 flex flex-col gap-1.5">
                {[...stack].reverse().map((val, i) => (
                  <div key={i} className="flex items-center gap-2 p-1.5 rounded bg-panel border-l-2 border-stack shadow-sm">
                    <span className="text-[10px] font-code text-dim">[{stack.length - 1 - i}]</span>
                    <span className="text-[12px] font-code flex-1 text-center font-medium">{val}</span>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </section>

        <div className="h-px bg-border w-full" />

        <section>
          <h2 className="text-[10px] font-medium uppercase tracking-widest text-dim mb-3">Memory</h2>
          <div className="grid grid-cols-4 gap-1.5">
            {memory.slice(0, 16).map((val, i) => (
              <div key={i} className="aspect-square flex flex-col items-center justify-center border border-border rounded bg-[#FEF3DC]/40 hover:bg-[#FEF3DC] transition-colors">
                <span className="text-[8px] text-dim leading-none mb-1">[{i}]</span>
                <span className="text-[11px] font-code font-medium">{val || '—'}</span>
              </div>
            ))}
          </div>
        </section>

      </div>
    </aside>
  );
};
