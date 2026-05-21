import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles } from 'lucide-react';

interface LogEntry {
  step: number;
  instruction: string;
  result: string;
}

export const LeftPanel = ({ 
  code, 
  setCode, 
  logs,
  onAiGenerate
}: { 
  code: string, 
  setCode: (c: string) => void,
  logs: LogEntry[],
  onAiGenerate: () => void
}) => {
  const examples = ["Sum", "Array", "Stack", "Loop", "User Input"];

  return (
    <aside className="w-[280px] h-[calc(100vh-48px-52px)] bg-panel border-r border-border flex flex-col">
      <div className="p-4 flex flex-col gap-4 overflow-hidden h-full">
        <div>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-[10px] font-medium uppercase tracking-widest text-dim">Program</h2>
            <button 
              onClick={onAiGenerate}
              className="text-[10px] flex items-center gap-1 text-primary hover:underline font-semibold"
            >
              <Sparkles className="w-3 h-3" />
              AI ARCHITECT
            </button>
          </div>
          <div className="relative rounded-lg overflow-hidden border border-[#2A2A2A] bg-[#1C1917]">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-[200px] bg-transparent text-[#E8E3D4] font-code text-[12px] p-4 resize-none focus:outline-none leading-relaxed"
              spellCheck={false}
            />
          </div>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {examples.map((ex) => (
              <button
                key={ex}
                className="px-2.5 py-1 text-[11px] font-medium border border-border rounded-full hover:bg-background transition-colors text-muted"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <h2 className="text-[10px] font-medium uppercase tracking-widest text-dim mb-3">Execution Log</h2>
          <ScrollArea className="flex-1 rounded-lg border border-border bg-background/30 overflow-auto">
            {logs.length === 0 ? (
              <div className="p-4 text-center text-dim italic text-[11px]">
                No steps recorded yet.
              </div>
            ) : (
              <div className="flex flex-col">
                {logs.map((log, i) => (
                  <div 
                    key={i} 
                    className={`flex items-start gap-3 p-2 text-[12px] border-b border-border/50 ${i % 2 === 0 ? 'bg-panel/40' : 'bg-transparent'}`}
                  >
                    <span className="font-code text-primary min-w-[20px] pt-0.5">{log.step}</span>
                    <div className="flex-1">
                      <div className="font-medium text-foreground">{log.instruction}</div>
                      <div className="text-[11px] text-muted">{log.result}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        <div className="pt-4 border-t border-border">
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Register', color: 'bg-secondary' },
              { label: 'ALU', color: 'bg-alu' },
              { label: 'Memory', color: 'bg-warning' },
              { label: 'Stack', color: 'bg-stack' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-sm ${item.color}`} />
                <span className="text-[10px] text-muted font-medium uppercase">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};
