
import { create } from 'zustand';

export interface LogEntry {
  step: number;
  instruction: string;
  result: string;
}

export interface AnimationEvent {
  id: string;
  type: 'move' | 'flash' | 'shake';
  startPos?: { x: number; y: number };
  endPos?: { x: number; y: number };
  color?: string;
  label?: string;
  target?: string;
}

interface CPUState {
  registers: Record<string, number>;
  memory: (number | null)[];
  stack: number[];
  pc: number;
  isRunning: boolean;
  isAnimating: boolean;
  executionLog: LogEntry[];
  currentAnimations: AnimationEvent[];
  activeBuildings: Record<string, 'source' | 'dest' | null>;
  program: string[];
  speed: number;

  // Actions
  setProgram: (code: string) => void;
  step: () => void;
  reset: () => void;
  setSpeed: (s: number) => void;
  addAnimation: (anim: AnimationEvent) => void;
  removeAnimation: (id: string) => void;
}

export const useCPUStore = create<CPUState>((set, get) => ({
  registers: { R0: 0, R1: 0, R2: 0, R3: 0, R4: 0, R5: 0 },
  memory: Array(16).fill(null),
  stack: [],
  pc: 0,
  isRunning: false,
  isAnimating: false,
  executionLog: [],
  currentAnimations: [],
  activeBuildings: {},
  program: ["MOV R1, 10", "MOV R2, 20", "ADD R3, R1, R2", "STORE R3, [0]", "HLT"],
  speed: 1,

  setProgram: (code: string) => {
    const lines = code.split('\n').map(l => l.trim()).filter(l => l !== '');
    set({ program: lines, pc: 0, executionLog: [], registers: { R0: 0, R1: 0, R2: 0, R3: 0, R4: 0, R5: 0 }, stack: [], memory: Array(16).fill(null) });
  },

  setSpeed: (s) => set({ speed: s }),

  addAnimation: (anim) => set(state => ({ 
    currentAnimations: [...state.currentAnimations, anim],
    isAnimating: true 
  })),

  removeAnimation: (id) => set(state => {
    const newAnims = state.currentAnimations.filter(a => a.id !== id);
    return { 
      currentAnimations: newAnims,
      isAnimating: newAnims.length > 0
    };
  }),

  reset: () => set({
    registers: { R0: 0, R1: 0, R2: 0, R3: 0, R4: 0, R5: 0 },
    memory: Array(16).fill(null),
    stack: [],
    pc: 0,
    executionLog: [],
    currentAnimations: [],
    activeBuildings: {},
    isAnimating: false
  }),

  step: async () => {
    const { pc, program, registers, memory, stack, speed, addAnimation, removeAnimation } = get();
    if (pc >= program.length) return;

    const instr = program[pc];
    const parts = instr.replace(',', '').split(/\s+/);
    const op = parts[0].toUpperCase();
    
    set({ isAnimating: true });
    const animId = Math.random().toString(36).substr(2, 9);
    const duration = 1000 / speed;

    // Simulation logic and animation triggers
    if (op === 'MOV') {
      const dest = parts[1];
      const src = parts[2];
      const val = src.startsWith('R') ? registers[src] : parseInt(src);
      
      // Animation from source to Register
      addAnimation({
        id: animId,
        type: 'move',
        startPos: src.startsWith('R') ? getBuildingPos(src) : getBuildingPos('PC'),
        endPos: getBuildingPos(dest),
        color: '#378ADD',
        label: val.toString()
      });

      set({ activeBuildings: { [src.startsWith('R') ? src : 'PC']: 'source', [dest]: 'dest' } });

      setTimeout(() => {
        set(state => ({
          registers: { ...state.registers, [dest]: val },
          pc: state.pc + 1,
          executionLog: [...state.executionLog, { step: state.pc + 1, instruction: instr, result: `${dest} = ${val}` }],
          activeBuildings: {},
        }));
        removeAnimation(animId);
      }, duration);
    } 
    else if (op === 'ADD') {
      const dest = parts[1];
      const src1 = parts[2];
      const src2 = parts[3];
      const v1 = registers[src1];
      const v2 = registers[src2];
      const res = v1 + v2;

      // Two cars to ALU
      const id1 = animId + '1';
      const id2 = animId + '2';
      addAnimation({ id: id1, type: 'move', startPos: getBuildingPos(src1), endPos: getBuildingPos('ALU'), color: '#1D9E75', label: v1.toString() });
      addAnimation({ id: id2, type: 'move', startPos: getBuildingPos(src2), endPos: getBuildingPos('ALU'), color: '#1D9E75', label: v2.toString() });
      
      set({ activeBuildings: { [src1]: 'source', [src2]: 'source', 'ALU': 'dest' } });

      setTimeout(() => {
        removeAnimation(id1);
        removeAnimation(id2);
        
        // One car from ALU to Dest
        const id3 = animId + '3';
        addAnimation({ id: id3, type: 'move', startPos: getBuildingPos('ALU'), endPos: getBuildingPos(dest), color: '#1D9E75', label: res.toString() });
        set({ activeBuildings: { 'ALU': 'source', [dest]: 'dest' } });

        setTimeout(() => {
          set(state => ({
            registers: { ...state.registers, [dest]: res },
            pc: state.pc + 1,
            executionLog: [...state.executionLog, { step: state.pc + 1, instruction: instr, result: `${dest} = ${res}` }],
            activeBuildings: {},
          }));
          removeAnimation(id3);
        }, duration);
      }, duration);
    }
    else if (op === 'STORE') {
      const src = parts[1];
      const addr = parseInt(parts[2].replace('[', '').replace(']', ''));
      const val = registers[src];

      addAnimation({ id: animId, type: 'move', startPos: getBuildingPos(src), endPos: getBuildingPos('RAM'), color: '#EF9F27', label: val.toString() });
      set({ activeBuildings: { [src]: 'source', 'RAM': 'dest' } });

      setTimeout(() => {
        set(state => {
          const newMem = [...state.memory];
          newMem[addr] = val;
          return {
            memory: newMem,
            pc: state.pc + 1,
            executionLog: [...state.executionLog, { step: state.pc + 1, instruction: instr, result: `MEM[${addr}] = ${val}` }],
            activeBuildings: {},
          };
        });
        removeAnimation(animId);
      }, duration);
    }
    else if (op === 'HLT') {
      set({ pc: program.length, isAnimating: false });
    } else {
      // Fallback for unimplemented instructions
      set(state => ({ pc: state.pc + 1 }));
    }
  }
}));

// Helper to get coordinates
function getBuildingPos(id: string) {
  if (id === 'PC') return { x: 400, y: 70 };
  if (id === 'R0') return { x: 84, y: 127 };
  if (id === 'R1') return { x: 84, y: 181 };
  if (id === 'R2') return { x: 84, y: 235 };
  if (id === 'R3') return { x: 84, y: 289 };
  if (id === 'ALU') return { x: 400, y: 330 };
  if (id === 'RAM') return { x: 700, y: 190 };
  if (id === 'STACK') return { x: 700, y: 480 };
  return { x: 400, y: 300 };
}
