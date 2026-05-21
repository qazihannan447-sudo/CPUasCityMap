
import { Instruction } from './parser';

export interface ExecutionResult {
  nextPC?: number;
  registers?: Record<string, number>;
  memory?: (number | null)[];
  stack?: number[];
  logMessage: string;
  animations: any[];
  activeBuildings: Record<string, 'source' | 'dest' | null>;
  requiresInput?: { register: string };
}

export function executeInstruction(
  instr: Instruction,
  state: {
    registers: Record<string, number>;
    memory: (number | null)[];
    stack: number[];
    pc: number;
    labels: Record<string, number>;
  }
): ExecutionResult {
  const { opcode, args } = instr;
  const { registers, memory, stack, pc, labels } = state;
  const result: ExecutionResult = {
    logMessage: '',
    animations: [],
    activeBuildings: {},
    nextPC: pc + 1
  };

  const getVal = (arg: string) => arg.startsWith('R') ? registers[arg] : parseInt(arg);
  const getAddr = (arg: string) => parseInt(arg.replace('MEM[', '').replace('[', '').replace(']', ''));

  switch (opcode) {
    case 'LOADI': {
      const dest = args[0];
      const val = parseInt(args[1]);
      result.registers = { ...registers, [dest]: val };
      result.logMessage = `${dest} loaded with immediate ${val}`;
      result.activeBuildings = { 'PC': 'source', [dest]: 'dest' };
      result.animations = [{ type: 'move', start: 'PC', end: dest, color: '#378ADD', label: val.toString() }];
      break;
    }
    case 'LOAD': {
      const dest = args[0];
      const addr = getAddr(args[1]);
      const val = memory[addr] || 0;
      result.registers = { ...registers, [dest]: val };
      result.logMessage = `${dest} loaded from MEM[${addr}]`;
      result.activeBuildings = { 'RAM': 'source', [dest]: 'dest' };
      result.animations = [{ type: 'move', start: 'RAM', end: dest, color: '#EF9F27', label: val.toString() }];
      break;
    }
    case 'STORE': {
      const src = args[0];
      const addr = getAddr(args[1]);
      const val = registers[src];
      const newMem = [...memory];
      newMem[addr] = val;
      result.memory = newMem;
      result.logMessage = `Stored ${val} from ${src} to MEM[${addr}]`;
      result.activeBuildings = { [src]: 'source', 'RAM': 'dest' };
      result.animations = [{ type: 'move', start: src, end: 'RAM', color: '#EF9F27', label: val.toString() }];
      break;
    }
    case 'ADD':
    case 'SUB':
    case 'MUL': {
      const dest = args[0];
      const s1 = args[1];
      const s2 = args[2];
      const v1 = getVal(s1);
      const v2 = getVal(s2);
      let res = 0;
      if (opcode === 'ADD') res = v1 + v2;
      if (opcode === 'SUB') res = v1 - v2;
      if (opcode === 'MUL') res = v1 * v2;
      
      result.registers = { ...registers, [dest]: res };
      result.logMessage = `${opcode} ${s1}, ${s2} -> ${dest} (${res})`;
      result.activeBuildings = { [s1]: 'source', [s2]: 'source', 'ALU': 'dest' };
      result.animations = [
        { type: 'move', start: s1, end: 'ALU', color: '#1D9E75', label: v1.toString(), delay: 0 },
        { type: 'move', start: s2, end: 'ALU', color: '#1D9E75', label: v2.toString(), delay: 0 },
        { type: 'move', start: 'ALU', end: dest, color: '#1D9E75', label: res.toString(), delay: 1 }
      ];
      break;
    }
    case 'PUSH': {
      const src = args[0];
      const val = registers[src];
      result.stack = [...stack, val];
      result.logMessage = `Pushed ${val} to stack`;
      result.activeBuildings = { [src]: 'source', 'STACK': 'dest' };
      result.animations = [{ type: 'move', start: src, end: 'STACK', color: '#D4537E', label: val.toString() }];
      break;
    }
    case 'POP': {
      const dest = args[0];
      const newStack = [...stack];
      const val = newStack.pop() || 0;
      result.stack = newStack;
      result.registers = { ...registers, [dest]: val };
      result.logMessage = `Popped ${val} to ${dest}`;
      result.activeBuildings = { 'STACK': 'source', [dest]: 'dest' };
      result.animations = [{ type: 'move', start: 'STACK', end: dest, color: '#D4537E', label: val.toString() }];
      break;
    }
    case 'JUMP': {
      const label = args[0];
      result.nextPC = labels[label] ?? pc;
      result.logMessage = `Jumping to ${label}`;
      result.activeBuildings = { 'PC': 'dest' };
      break;
    }
    case 'JUMPIF': {
      const reg = args[0];
      const label = args[1];
      if (registers[reg] !== 0) {
        result.nextPC = labels[label] ?? pc;
        result.logMessage = `Condition met, jumping to ${label}`;
      } else {
        result.logMessage = `Condition not met, skipping jump`;
      }
      result.activeBuildings = { [reg]: 'source', 'PC': 'dest' };
      break;
    }
    case 'READ': {
      result.requiresInput = { register: args[0] };
      result.logMessage = `Waiting for user input for ${args[0]}`;
      break;
    }
    case 'HLT': {
      result.nextPC = -1; // Flag for finish
      result.logMessage = `Execution Halted`;
      break;
    }
    default:
      result.logMessage = `Unknown instruction ${opcode}`;
  }

  return result;
}
