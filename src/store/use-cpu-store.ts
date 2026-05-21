import { create } from 'zustand';
import { parseProgram, Instruction, ParsedProgram } from '@/engine/parser';
import { executeInstruction, ExecutionResult } from '@/engine/executor';

export interface LogEntry {
  step: number;
  instruction: string;
  result: string;
  isError?: boolean;
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

interface Metrics {
  instructions: number;
  regWrites: number;
  memWrites: number;
  stackMax: number;
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
  activeBuildings: Record<string, 'source' | 'dest' | 'error' | null>;
  rawCode: string;
  speed: number;
  theme: 'day' | 'night';
  metrics: Metrics;
  introPhase: number; // 0 to 6 for splash

  // Actions
  setProgram: (code: string) => void;
  step: () => Promise<void>;
  togglePlay: () => void;
  reset: () => void;
  setSpeed: (s: number) => void;
  submitInput: (val: number) => void;
  addAnimation: (anim: AnimationEvent) => void;
  removeAnimation: (id: string) => void;
  toggleTheme: () => void;
  setIntroPhase: (p: number) => void;
}

export const DEFAULT_CODE = `# Sum of two numbers
LOADI R1 7
LOADI R2 3
ADD R3 R1 R2
STORE R3 MEM[0]
PUSH R1
PUSH R2
POP R4
HLT`;

export const SAMPLES = {
  Sum: `# Sum of two numbers
LOADI R1 7
LOADI R2 3
ADD R3 R1 R2
STORE R3 MEM[0]
HLT`,
  Array: `# Array & Memory
LOADI R1 10
LOADI R2 20
STORE R1 MEM[0]
STORE R2 MEM[1]
LOAD R3 MEM[0]
ADD R4 R3 R2
HLT`,
  Stack: `# Stack demo
LOADI R1 5
LOADI R2 8
PUSH R1
PUSH R2
POP R3
POP R4
HLT`,
  Loop: `# Iteration Loop
LOADI R1 0
LOADI R2 1
loop:
ADD R1 R1 R2
JUMPIF R1 < 5 loop
HLT`,
  UserInput: `# Interactive Math
READ R1
READ R2
ADD R3 R1 R2
STORE R3 MEM[0]
HLT`,
};

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
  theme: 'day',
  metrics: { instructions: 0, regWrites: 0, memWrites: 0, stackMax: 0 },
  introPhase: 0,

  setProgram: (code: string) => {
    const { instructions, labels } = parseProgram(code);
    set({ 
      rawCode: code, 
      instructions, 
      labels, 
      pc: 0, 
      executionLog: [], 
      registers: { R0: 0, R1: 0, R2: 0, R3: 0, R4: 0, R5: 0 }, 
      stack: [], 
      memory: Array(16).fill(null), 
      isRunning: false,
      metrics: { instructions: 0, regWrites: 0, memWrites: 0, stackMax: 0 }
    });
  },

  setSpeed: (s) => set({ speed: s }),
  toggleTheme: () => set(s => ({ theme: s.theme === 'day' ? 'night' : 'day' })),
  setIntroPhase: (p) => set({ introPhase: p }),

  togglePlay: () => {
    const { isPaused } = get();
    set({ isPaused: !isPaused, isRunning: true });
  },

  submitInput: (val) => {
    const { awaitingInput, registers, pc, executionLog, metrics } = get();
    if (!awaitingInput) return;
    set({
      registers: { ...registers, [awaitingInput.register]: val },
      awaitingInput: null,
      pc: pc + 1,
      executionLog: [...executionLog, { step: pc + 1, instruction: 'READ', result: `Input ${val} -> ${awaitingInput.register}` }],
      metrics: { ...metrics, regWrites: metrics.regWrites + 1 }
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
    awaitingInput: null,
    metrics: { instructions: 0, regWrites: 0, memWrites: 0, stackMax: 0 }
  }),

  step: async () => {
    const { pc, instructions, registers, memory, stack, labels, speed, addAnimation, removeAnimation, isAnimating, awaitingInput, metrics } = get();
    if (isAnimating || awaitingInput || pc >= instructions.length || pc === -1) return;

    const instr = instructions[pc];
    const result = executeInstruction(instr, { registers, memory, stack, pc, labels });

    if (result.requiresInput) {
      set({ awaitingInput: result.requiresInput });
      return;
    }

    set({ isAnimating: true, activeBuildings: result.activeBuildings });
    const duration = 1000 / speed;

    // Trigger animations
    if (result.isError) {
      set(s => ({ executionLog: [...s.executionLog, { step: s.pc + 1, instruction: instr.raw, result: result.logMessage, isError: true }] }));
      await new Promise(r => setTimeout(r, duration));
      set({ isAnimating: false, activeBuildings: {} });
      return;
    }

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

      setTimeout(() => removeAnimation(animId), duration);
    }

    await new Promise(r => setTimeout(r, duration * (result.animations.length > 1 ? 2 : 1)));

    // Final State Update
    const nextRegs = result.registers ?? registers;
    const nextMem = result.memory ?? memory;
    const nextStack = result.stack ?? stack;
    
    set(state => ({
      registers: nextRegs,
      memory: nextMem,
      stack: nextStack,
      pc: result.nextPC ?? state.pc,
      executionLog: [...state.executionLog, { step: state.pc + 1, instruction: instr.raw, result: result.logMessage }],
      activeBuildings: {},
      isAnimating: false,
      metrics: {
        instructions: state.metrics.instructions + 1,
        regWrites: result.registers ? state.metrics.regWrites + 1 : state.metrics.regWrites,
        memWrites: result.memory ? state.metrics.memWrites + 1 : state.metrics.memWrites,
        stackMax: Math.max(state.metrics.stackMax, nextStack.length)
      }
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
