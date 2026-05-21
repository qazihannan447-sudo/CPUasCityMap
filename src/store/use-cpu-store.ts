
import { create } from 'zustand';
import { parseProgram, Instruction, ParsedProgram } from '@/engine/parser';
import { executeInstruction, ExecutionResult } from '@/engine/executor';

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
  instructions: Instruction[];
  labels: Record<string, number>;
  isRunning: boolean;
  isAnimating: boolean;
  isPaused: boolean;
  awaitingInput: { register: string } | null;
  executionLog: LogEntry[];
  currentAnimations: AnimationEvent[];
  activeBuildings: Record<string, 'source' | 'dest' | null>;
  rawCode: string;
  speed: number;

  // Actions
  setProgram: (code: string) => void;
  step: () => Promise<void>;
  togglePlay: () => void;
  reset: () => void;
  setSpeed: (s: number) => void;
  submitInput: (val: number) => void;
  addAnimation: (anim: AnimationEvent) => void;
  removeAnimation: (id: string) => void;
}

const DEFAULT_CODE = `# Sum of two numbers
LOADI R1 7
LOADI R2 3
ADD R3 R1 R2
STORE R3 MEM[0]
PUSH R1
PUSH R2
POP R4
HLT`;

export const useCPUStore = create<CPUState>((set, get) => ({
  registers: { R0: 0, R1: 0, R2: 0, R3: 0, R4: 0, R5: 0 },
  memory: Array(16).fill(null),
  stack: [],
  pc: 0,
  instructions: [],
  labels: {},
  isRunning: false,
  isAnimating: false,
  isPaused: true,
  awaitingInput: null,
  executionLog: [],
  currentAnimations: [],
  activeBuildings: {},
  rawCode: DEFAULT_CODE,
  speed: 1,

  setProgram: (code: string) => {
    const { instructions, labels } = parseProgram(code);
    set({ rawCode: code, instructions, labels, pc: 0, executionLog: [], registers: { R0: 0, R1: 0, R2: 0, R3: 0, R4: 0, R5: 0 }, stack: [], memory: Array(16).fill(null), isRunning: false });
  },

  setSpeed: (s) => set({ speed: s }),

  togglePlay: () => {
    const { isPaused, isRunning } = get();
    set({ isPaused: !isPaused, isRunning: true });
  },

  submitInput: (val) => {
    const { awaitingInput, registers, pc, executionLog } = get();
    if (!awaitingInput) return;
    set({
      registers: { ...registers, [awaitingInput.register]: val },
      awaitingInput: null,
      pc: pc + 1,
      executionLog: [...executionLog, { step: pc + 1, instruction: 'READ', result: `Received input ${val} to ${awaitingInput.register}` }]
    });
  },

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
    isAnimating: false,
    isPaused: true,
    isRunning: false,
    awaitingInput: null
  }),

  step: async () => {
    const { pc, instructions, registers, memory, stack, labels, speed, addAnimation, removeAnimation, isAnimating, awaitingInput } = get();
    if (isAnimating || awaitingInput || pc >= instructions.length || pc === -1) return;

    const instr = instructions[pc];
    const result = executeInstruction(instr, { registers, memory, stack, pc, labels });

    if (result.requiresInput) {
      set({ awaitingInput: result.requiresInput });
      return;
    }

    set({ isAnimating: true, activeBuildings: result.activeBuildings });
    const duration = 1000 / speed;

    // Execute animations sequentially or in parallel based on result.animations
    for (const anim of result.animations) {
      const animId = Math.random().toString(36).substr(2, 9);
      if (anim.delay) await new Promise(r => setTimeout(r, anim.delay * duration));
      
      addAnimation({
        id: animId,
        type: 'move',
        startPos: getBuildingPos(anim.start),
        endPos: getBuildingPos(anim.end),
        color: anim.color,
        label: anim.label
      });

      // We don't await the removal here so multiple can run, 
      // but the for loop waits if there's a delay between cars
      setTimeout(() => removeAnimation(animId), duration);
    }

    // Wait for the last animation to finish before updating state
    await new Promise(r => setTimeout(r, duration * (result.animations.length > 1 ? 2 : 1)));

    set(state => ({
      registers: result.registers ?? state.registers,
      memory: result.memory ?? state.memory,
      stack: result.stack ?? state.stack,
      pc: result.nextPC ?? state.pc,
      executionLog: [...state.executionLog, { step: state.pc + 1, instruction: instr.raw, result: result.logMessage }],
      activeBuildings: {},
      isAnimating: false
    }));

    if (result.nextPC === -1) {
      set({ isRunning: false, isPaused: true });
    }
  }
}));

function getBuildingPos(id: string) {
  if (id === 'PC') return { x: 400, y: 70 };
  if (id === 'R0') return { x: 84, y: 127 };
  if (id === 'R1') return { x: 84, y: 181 };
  if (id === 'R2') return { x: 84, y: 235 };
  if (id === 'R3') return { x: 84, y: 289 };
  if (id === 'R4') return { x: 84, y: 343 };
  if (id === 'R5') return { x: 84, y: 397 };
  if (id === 'ALU') return { x: 400, y: 330 };
  if (id === 'RAM') return { x: 700, y: 190 };
  if (id === 'STACK') return { x: 700, y: 480 };
  return { x: 400, y: 300 };
}
