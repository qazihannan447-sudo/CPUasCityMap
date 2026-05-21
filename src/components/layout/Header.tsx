import React from 'react';
import { Building2, RotateCcw, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Header = ({ currentInstruction }: { currentInstruction?: string }) => {
  return (
    <header className="h-[48px] border-b border-border bg-panel px-4 flex items-center justify-between z-50">
      <div className="flex items-center gap-2">
        <div className="bg-primary p-1 rounded-sm">
          <Building2 className="w-4 h-4 text-white" />
        </div>
        <span className="text-[16px] font-semibold tracking-tight">CPU City</span>
      </div>

      <div className="flex-1 flex justify-center">
        {currentInstruction && (
          <div className="bg-background border-l-4 border-primary px-4 py-1 rounded-md shadow-sm">
            <code className="text-[13px] font-medium text-foreground">
              {currentInstruction}
            </code>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="h-8 border-border text-muted gap-1.5">
          <Plus className="w-3.5 h-3.5" />
          New Program
        </Button>
        <Button variant="outline" size="sm" className="h-8 border-destructive/20 text-destructive hover:bg-destructive/5 gap-1.5">
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </Button>
      </div>
    </header>
  );
};
