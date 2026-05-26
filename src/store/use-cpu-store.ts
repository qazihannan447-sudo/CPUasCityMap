import { create } from 'zustand';
import { parseProgram, Instruction, ParsedProgram } from '@/engine/parser';
import { executeInstruction, ExecutionResult } from '@/engine/executor';

export interface LogEntry {
  step: number;
  instruction: string;
  result: string;
  isError?: boolean;
  isComplete?: boolean;
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
  lastWrittenMemAddr: number | null;
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

export const DEFAULT_CODE = `# Sum two numbers
LOADI R1 7
LOADI R2 3
ADD R1 R2 R3`;

export const SAMPLES = {
  Sum: `# Sum two numbers
LOADI R1 7
LOADI R2 3
ADD R1 R2 R3`,
  Array: `# Array sum
LOADI R1 10
LOADI R2 20
STORE R1 MEM[0]
STORE R2 MEM[1]
LOAD R3 MEM[0]
LOAD R4 MEM[1]
ADD R3 R4 R5`,
  Stack: `# Stack demo
LOADI R1 5
LOADI R2 8
PUSH R1
PUSH R2
POP R3
POP R4`,
  Loop: `# Count loop
LOADI R1 0
LOADI R2 1
loop:
ADD R1 R2 R1
JUMPIF R1 < 5 loop`,
  UserInput: `# User input
READ R1
READ R2
ADD R1 R2 R3
STORE R3 MEM[0]`,
  RegisterSwapUsingStack: `# Register swap using stack
# Shows: LOADI, PUSH, POP, stack as temp storage
LOADI R1 42
LOADI R2 99
PUSH R1
PUSH R2
POP R1
POP R2`,
  ComputeAverageOfTwoNumbers: `# Average of two numbers
# Shows: LOADI, ADD, memory, arithmetic chain
LOADI R1 10
LOADI R2 20
ADD R1 R2 R3
LOADI R4 2
STORE R3 MEM[0]
STORE R4 MEM[1]`,
  CountdownFrom5To0: `# Countdown from 5
# Shows: LOADI, SUB, JUMPIF loop, full loop with termination
LOADI R1 5
LOADI R2 1
loop:
SUB R1 R2 R1
JUMPIF R1 > 0 loop`,
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
  lastWrittenMemAddr: null,
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
      lastWrittenMemAddr: null,
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
    lastWrittenMemAddr: null,
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
    const writtenMemAddr = result.memory ? getMemoryAddr(instr.args[1]) : null;
    const nextPC = result.nextPC ?? pc;
    const didCompleteNaturally = result.halted !== true && nextPC >= instructions.length;
    
    set(state => {
      const executedCount = state.metrics.instructions + 1;
      const executionLog = [
        ...state.executionLog,
        { step: state.pc + 1, instruction: instr.raw, result: result.logMessage },
      ];

      if (didCompleteNaturally) {
        executionLog.push({
          step: nextPC,
          instruction: 'COMPLETE',
          result: `✓ Program complete — ${executedCount} instructions executed`,
          isComplete: true,
        });
      }

      return {
        registers: nextRegs,
        memory: nextMem,
        stack: nextStack,
        pc: nextPC,
        executionLog,
        activeBuildings: {},
        ...(writtenMemAddr !== null ? { lastWrittenMemAddr: writtenMemAddr } : {}),
        isAnimating: false,
        metrics: {
          instructions: executedCount,
          regWrites: result.registers ? state.metrics.regWrites + 1 : state.metrics.regWrites,
          memWrites: result.memory ? state.metrics.memWrites + 1 : state.metrics.memWrites,
          stackMax: Math.max(state.metrics.stackMax, nextStack.length)
        }
      };
    });

    if (writtenMemAddr !== null) {
      setTimeout(() => {
        if (get().lastWrittenMemAddr === writtenMemAddr) {
          set({ lastWrittenMemAddr: null });
        }
      }, 800);
    }

    if (result.halted === true || result.nextPC === -1) {
      set({ isRunning: false, isPaused: true });
    }
  }
}));

function getMemoryAddr(arg?: string) {
  if (!arg) return null;
  const addr = Number(arg.replace('MEM[', '').replace('[', '').replace(']', ''));
  return Number.isFinite(addr) ? addr : null;
}

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
