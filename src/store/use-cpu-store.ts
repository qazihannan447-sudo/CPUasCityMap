import { create } from 'zustand';
import { parseProgram, Instruction, ProgramDiagnostic } from '@/engine/parser';
import { executeInstruction, ExecutionResult } from '@/engine/executor';
import { DEFAULT_CODE, SAMPLES } from '@/engine/samples';
import { getBuildingCenter } from '@/config/buildings';

export { DEFAULT_CODE, SAMPLES } from '@/engine/samples';

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

interface HistorySnapshot {
  registers: Record<string, number>;
  memory: (number | null)[];
  stack: number[];
  pc: number;
  instructions: Instruction[];
  labels: Record<string, number>;
  executionLog: LogEntry[];
  lastWrittenMemAddr: number | null;
  lastMemoryAccess: { addr: number; kind: 'read' | 'write' } | null;
  rawCode: string;
  metrics: Metrics;
  awaitingInput: { register: string } | null;
  programErrors: ProgramDiagnostic[];
  lastErrorLine: number | null;
}

interface SetProgramOptions {
  pushHistory?: boolean;
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
  lastMemoryAccess: { addr: number; kind: 'read' | 'write' } | null;
  rawCode: string;
  speed: number;
  theme: 'day' | 'night';
  metrics: Metrics;
  introPhase: number;
  programErrors: ProgramDiagnostic[];
  lastErrorLine: number | null;
  errorFlashTarget: 'RAM' | 'STACK' | null;
  history: HistorySnapshot[];

  setProgram: (code: string, options?: SetProgramOptions) => void;
  step: () => Promise<void>;
  togglePlay: () => void;
  reset: (pushHistory?: boolean) => void;
  undo: () => void;
  setSpeed: (s: number) => void;
  submitInput: (val: number) => void;
  addAnimation: (anim: AnimationEvent) => void;
  removeAnimation: (id: string) => void;
  toggleTheme: () => void;
  setIntroPhase: (p: number) => void;
  clearErrorFlash: () => void;
}

const EMPTY_METRICS: Metrics = {
  instructions: 0,
  regWrites: 0,
  memWrites: 0,
  stackMax: 0,
};

const EMPTY_REGISTERS = {
  R0: 0,
  R1: 0,
  R2: 0,
  R3: 0,
  R4: 0,
  R5: 0,
};

const initialProgram = parseProgram(DEFAULT_CODE);

export const useCPUStore = create<CPUState>((set, get) => ({
  registers: cloneRegisters(EMPTY_REGISTERS),
  memory: Array(16).fill(null),
  stack: [],
  pc: 0,
  instructions: initialProgram.instructions,
  labels: initialProgram.labels,
  isRunning: false,
  isAnimating: false,
  isPaused: true,
  awaitingInput: null,
  executionLog: [],
  currentAnimations: [],
  activeBuildings: {},
  lastWrittenMemAddr: null,
  lastMemoryAccess: null,
  rawCode: DEFAULT_CODE,
  speed: 1,
  theme: 'day',
  metrics: { ...EMPTY_METRICS },
  introPhase: 0,
  programErrors: initialProgram.errors,
  lastErrorLine: initialProgram.errors[0]?.line ?? null,
  errorFlashTarget: null,
  history: [],

  setProgram: (code, options = {}) => {
    const parsed = parseProgram(code);
    set((state) => ({
      ...(options.pushHistory ? { history: appendHistory(state) } : {}),
      rawCode: code,
      instructions: parsed.instructions,
      labels: parsed.labels,
      programErrors: parsed.errors,
      lastErrorLine: parsed.errors[0]?.line ?? null,
      registers: cloneRegisters(EMPTY_REGISTERS),
      memory: Array(16).fill(null),
      stack: [],
      pc: 0,
      executionLog: [],
      currentAnimations: [],
      activeBuildings: {},
      lastWrittenMemAddr: null,
      lastMemoryAccess: null,
      isAnimating: false,
      isPaused: true,
      isRunning: false,
      awaitingInput: null,
      errorFlashTarget: null,
      metrics: { ...EMPTY_METRICS },
    }));
  },

  setSpeed: (speed) => set({ speed }),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'day' ? 'night' : 'day' })),
  setIntroPhase: (introPhase) => set({ introPhase }),
  clearErrorFlash: () => set({ errorFlashTarget: null }),

  togglePlay: () => {
    const { isPaused, awaitingInput, programErrors, isAnimating, instructions, pc } = get();
    if (awaitingInput || programErrors.length > 0 || isAnimating || instructions.length === 0 || pc === -1) {
      return;
    }
    set({ isPaused: !isPaused, isRunning: true });
  },

  submitInput: (value) => {
    const { awaitingInput, registers, pc, executionLog, metrics, speed } = get();
    if (!awaitingInput) return;

    const register = awaitingInput.register;
    const animationId = crypto.randomUUID();
    const duration = 1000 / speed;

    set((state) => ({
      history: appendHistory(state),
      registers: { ...registers, [register]: value },
      awaitingInput: null,
      pc: pc + 1,
      executionLog: [
        ...executionLog,
        { step: pc + 1, instruction: `READ ${register}`, result: `Input ${value} -> ${register}` },
      ],
      currentAnimations: [
        ...state.currentAnimations,
        {
          id: animationId,
          type: 'move',
          startPos: getBuildingCenter('PC'),
          endPos: getBuildingCenter(register),
          color: '#534AB7',
          label: String(value),
        },
      ],
      activeBuildings: { PC: 'source', [register]: 'dest' },
      isAnimating: true,
      errorFlashTarget: null,
      lastErrorLine: null,
      metrics: { ...metrics, regWrites: metrics.regWrites + 1 },
    }));

    window.setTimeout(() => {
      set((state) => {
        const animations = state.currentAnimations.filter((animation) => animation.id !== animationId);
        return {
          currentAnimations: animations,
          activeBuildings: animations.length > 0 ? state.activeBuildings : {},
          isAnimating: animations.length > 0,
        };
      });
    }, duration);
  },

  addAnimation: (animation) =>
    set((state) => ({
      currentAnimations: [...state.currentAnimations, animation],
      isAnimating: true,
    })),

  removeAnimation: (id) =>
    set((state) => {
      const currentAnimations = state.currentAnimations.filter((animation) => animation.id !== id);
      return {
        currentAnimations,
        isAnimating: currentAnimations.length > 0,
      };
    }),

  reset: (pushHistory = true) =>
    set((state) => ({
      ...(pushHistory ? { history: appendHistory(state) } : {}),
      registers: cloneRegisters(EMPTY_REGISTERS),
      memory: Array(16).fill(null),
      stack: [],
      pc: 0,
      executionLog: [],
      currentAnimations: [],
      activeBuildings: {},
      lastWrittenMemAddr: null,
      lastMemoryAccess: null,
      isAnimating: false,
      isPaused: true,
      isRunning: false,
      awaitingInput: null,
      errorFlashTarget: null,
      lastErrorLine: state.programErrors[0]?.line ?? null,
      metrics: { ...EMPTY_METRICS },
    })),

  undo: () =>
    set((state) => {
      if (state.history.length === 0) {
        return {};
      }

      const snapshot = state.history[state.history.length - 1];
      return {
        ...restoreSnapshot(snapshot),
        history: state.history.slice(0, -1),
      };
    }),

  step: async () => {
    const state = get();
    const {
      pc,
      instructions,
      registers,
      memory,
      stack,
      labels,
      speed,
      addAnimation,
      removeAnimation,
      isAnimating,
      awaitingInput,
      metrics,
      programErrors,
    } = state;

    if (isAnimating || awaitingInput || programErrors.length > 0 || pc >= instructions.length || pc === -1) {
      return;
    }

    const instruction = instructions[pc];
    const result = executeInstruction(instruction, { registers, memory, stack, pc, labels });
    const history = appendHistory(state);

    if (result.requiresInput) {
      set({
        history,
        awaitingInput: result.requiresInput,
        activeBuildings: { PC: 'source', [result.requiresInput.register]: 'dest' },
        lastErrorLine: null,
        errorFlashTarget: null,
      });
      return;
    }

    set({
      history,
      isAnimating: true,
      activeBuildings: result.activeBuildings,
      errorFlashTarget: result.errorTarget === 'RAM' || result.errorTarget === 'STACK' ? result.errorTarget : null,
    });

    const duration = 1000 / speed;

    if (result.isError || result.error === true) {
      set((current) => ({
        executionLog: [
          ...current.executionLog,
          {
            step: current.pc + 1,
            instruction: instruction.raw,
            result: result.logMessage,
            isError: true,
          },
        ],
        isRunning: false,
        isPaused: true,
        lastErrorLine: instruction.line,
      }));

      await wait(duration);

      set({
        isAnimating: false,
        activeBuildings: {},
      });

      if (result.errorTarget === 'RAM' || result.errorTarget === 'STACK') {
        window.setTimeout(() => get().clearErrorFlash(), 900);
      }
      return;
    }

    const animations = [
      ...result.animations,
      ...(result.animationSpec ? [animationSpecToAnimation(result.animationSpec)] : []),
    ];

    for (const animation of animations) {
      const animationId = crypto.randomUUID();
      if (animation.delay) {
        await wait(animation.delay * duration);
      }

      addAnimation({
        id: animationId,
        type: 'move',
        startPos: getBuildingCenter(animation.start),
        endPos: getBuildingCenter(animation.end),
        color: animation.color,
        label: animation.label,
      });

      window.setTimeout(() => removeAnimation(animationId), duration);
    }

    await wait(duration * (animations.length > 1 ? 2 : 1));

    const nextRegisters = result.registers ?? registers;
    const nextMemory = result.memory ?? memory;
    const nextStack = result.stack ?? stack;
    const writtenMemAddr = result.memory ? getMemoryAddr(instruction.args[0]) : null;
    const memoryAccess = getMemoryAccessEvent(instruction);
    const nextPC = result.nextPC ?? pc + 1;
    const didCompleteNaturally = result.halted !== true && nextPC >= instructions.length;

    set((current) => {
      const executedCount = current.metrics.instructions + 1;
      const executionLog = [
        ...current.executionLog,
        { step: current.pc + 1, instruction: instruction.raw, result: result.logMessage },
      ];

      if (didCompleteNaturally) {
        executionLog.push({
          step: nextPC,
          instruction: 'COMPLETE',
          result: `Program complete after ${executedCount} executed instructions.`,
          isComplete: true,
        });
      }

      return {
        registers: nextRegisters,
        memory: nextMemory,
        stack: nextStack,
        pc: nextPC,
        executionLog,
        activeBuildings: {},
        ...(writtenMemAddr !== null ? { lastWrittenMemAddr: writtenMemAddr } : {}),
        lastMemoryAccess: memoryAccess,
        isAnimating: false,
        errorFlashTarget: null,
        lastErrorLine: null,
        metrics: {
          instructions: executedCount,
          regWrites: result.registers ? current.metrics.regWrites + 1 : current.metrics.regWrites,
          memWrites: result.memory ? current.metrics.memWrites + 1 : current.metrics.memWrites,
          stackMax: Math.max(current.metrics.stackMax, nextStack.length),
        },
      };
    });

    if (writtenMemAddr !== null) {
      window.setTimeout(() => {
        if (get().lastWrittenMemAddr === writtenMemAddr) {
          set({ lastWrittenMemAddr: null });
        }
      }, 800);
    }

    if (memoryAccess) {
      window.setTimeout(() => {
        const currentAccess = get().lastMemoryAccess;
        if (currentAccess && currentAccess.addr === memoryAccess.addr && currentAccess.kind === memoryAccess.kind) {
          set({ lastMemoryAccess: null });
        }
      }, 1100);
    }

    if (result.halted === true || result.nextPC === -1) {
      set({ isRunning: false, isPaused: true });
    }
  },
}));

function cloneRegisters(registers: Record<string, number>) {
  return { ...registers };
}

function cloneExecutionLog(executionLog: LogEntry[]) {
  return executionLog.map((entry) => ({ ...entry }));
}

function cloneMetrics(metrics: Metrics) {
  return { ...metrics };
}

function createHistorySnapshot(state: CPUState): HistorySnapshot {
  return {
    registers: cloneRegisters(state.registers),
    memory: [...state.memory],
    stack: [...state.stack],
    pc: state.pc,
    instructions: state.instructions,
    labels: { ...state.labels },
    executionLog: cloneExecutionLog(state.executionLog),
    lastWrittenMemAddr: state.lastWrittenMemAddr,
    lastMemoryAccess: state.lastMemoryAccess ? { ...state.lastMemoryAccess } : null,
    rawCode: state.rawCode,
    metrics: cloneMetrics(state.metrics),
    awaitingInput: state.awaitingInput ? { ...state.awaitingInput } : null,
    programErrors: state.programErrors.map((error) => ({ ...error })),
    lastErrorLine: state.lastErrorLine,
  };
}

function appendHistory(state: CPUState) {
  return [...state.history.slice(-39), createHistorySnapshot(state)];
}

function restoreSnapshot(snapshot: HistorySnapshot) {
  return {
    registers: cloneRegisters(snapshot.registers),
    memory: [...snapshot.memory],
    stack: [...snapshot.stack],
    pc: snapshot.pc,
    instructions: snapshot.instructions,
    labels: { ...snapshot.labels },
    executionLog: cloneExecutionLog(snapshot.executionLog),
    lastWrittenMemAddr: snapshot.lastWrittenMemAddr,
    lastMemoryAccess: snapshot.lastMemoryAccess ? { ...snapshot.lastMemoryAccess } : null,
    rawCode: snapshot.rawCode,
    metrics: cloneMetrics(snapshot.metrics),
    awaitingInput: snapshot.awaitingInput ? { ...snapshot.awaitingInput } : null,
    programErrors: snapshot.programErrors.map((error) => ({ ...error })),
    lastErrorLine: snapshot.lastErrorLine,
    currentAnimations: [],
    activeBuildings: {},
    isAnimating: false,
    isPaused: true,
    isRunning: false,
    errorFlashTarget: null,
  };
}

function getMemoryAddr(arg?: string) {
  if (!arg) return null;
  const addr = Number(arg.replace('MEM[', '').replace(']', ''));
  return Number.isFinite(addr) ? addr : null;
}

function getMemoryAccessEvent(instruction: Instruction) {
  if (instruction.opcode === 'LOAD') {
    const addr = getMemoryAddr(instruction.args[1]);
    return addr !== null ? { addr, kind: 'read' as const } : null;
  }

  if (instruction.opcode === 'STORE') {
    const addr = getMemoryAddr(instruction.args[0]);
    return addr !== null ? { addr, kind: 'write' as const } : null;
  }

  return null;
}

function animationSpecToAnimation(spec: NonNullable<ExecutionResult['animationSpec']>) {
  return {
    type: 'move' as const,
    start: spec.from,
    end: spec.to,
    color: spec.color,
    label: spec.label,
    delay: 0,
  };
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}
