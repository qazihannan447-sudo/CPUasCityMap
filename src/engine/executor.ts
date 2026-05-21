import { Instruction } from './parser';

export interface ExecutionResult {
  nextPC?: number;
  registers?: Record<string, number>;
  memory?: (number | null)[];
  stack?: number[];
  logMessage: string;
  animations: any[];
  activeBuildings: Record<string, 'source' | 'dest' | 'error' | null>;
  requiresInput?: { register: string };
  isError?: boolean;
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

  const getVal = (arg: string) => {
    if (arg.startsWith('R')) return registers[arg] || 0;
    if (arg.startsWith('MEM[')) return memory[getAddr(arg)] || 0;
    return parseInt(arg) || 0;
  };

  const getAddr = (arg: string) => parseInt(arg.replace('MEM[', '').replace('[', '').replace(']', ''));

  switch (opcode) {
    case 'LOADI': {
      const dest = args[0];
      const val = parseInt(args[1]);
      result.registers = { ...registers, [dest]: val };
      result.logMessage = `${dest} = ${val}`;
      result.activeBuildings = { 'PC': 'source', [dest]: 'dest' };
      result.animations = [{ type: 'move', start: 'PC', end: dest, color: '#378ADD', label: val.toString() }];
      break;
    }
    case 'LOAD': {
      const dest = args[0];
      const addr = getAddr(args[1]);
      if (addr >= memory.length) {
        result.isError = true;
        result.logMessage = `SEGFAULT: MEM[${addr}] out of bounds`;
        result.activeBuildings = { 'RAM': 'error' };
        break;
      }
      const val = memory[addr] || 0;
      result.registers = { ...registers, [dest]: val };
      result.logMessage = `${dest} = MEM[${addr}] (${val})`;
      result.activeBuildings = { 'RAM': 'source', [dest]: 'dest' };
      result.animations = [{ type: 'move', start: 'RAM', end: dest, color: '#EF9F27', label: val.toString() }];
      break;
    }
    case 'STORE': {
      const src = args[0];
      const addr = getAddr(args[1]);
      const val = registers[src];
      if (addr >= memory.length) {
        result.isError = true;
        result.logMessage = `SEGFAULT: MEM[${addr}] out of bounds`;
        result.activeBuildings = { 'RAM': 'error' };
        break;
      }
      const newMem = [...memory];
      newMem[addr] = val;
      result.memory = newMem;
      result.logMessage = `MEM[${addr}] = ${val}`;
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
      result.logMessage = `${dest} = ${v1} ${opcode === 'ADD' ? '+' : opcode === 'SUB' ? '-' : '*'} ${v2} = ${res}`;
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
      result.logMessage = `PUSHED ${val}`;
      result.activeBuildings = { [src]: 'source', 'STACK': 'dest' };
      result.animations = [{ type: 'move', start: src, end: 'STACK', color: '#D4537E', label: val.toString() }];
      break;
    }
    case 'POP': {
      const dest = args[0];
      if (stack.length === 0) {
        result.isError = true;
        result.logMessage = `STACK UNDERFLOW: Pop from empty stack`;
        result.activeBuildings = { 'STACK': 'error' };
        break;
      }
      const newStack = [...stack];
      const val = newStack.pop() || 0;
      result.stack = newStack;
      result.registers = { ...registers, [dest]: val };
      result.logMessage = `POPPED ${val}`;
      result.activeBuildings = { 'STACK': 'source', [dest]: 'dest' };
      result.animations = [{ type: 'move', start: 'STACK', end: dest, color: '#D4537E', label: val.toString() }];
      break;
    }
    case 'JUMP': {
      const label = args[0];
      result.nextPC = labels[label] ?? pc;
      result.logMessage = `JMP -> ${label}`;
      result.activeBuildings = { 'PC': 'dest' };
      break;
    }
    case 'JUMPIF': {
      // Syntax: JUMPIF R1 < 5 label
      const reg = args[0];
      const op = args[1];
      const val = parseInt(args[2]);
      const label = args[3];
      
      const regVal = registers[reg] || 0;
      let condition = false;
      if (op === '<') condition = regVal < val;
      if (op === '>') condition = regVal > val;
      if (op === '==') condition = regVal === val;
      if (op === '!=') condition = regVal !== val;
      if (op === '<=') condition = regVal <= val;
      if (op === '>=') condition = regVal >= val;

      if (condition) {
        result.nextPC = labels[label] ?? pc;
        result.logMessage = `IF ${regVal} ${op} ${val} (True) -> JMP ${label}`;
      } else {
        result.logMessage = `IF ${regVal} ${op} ${val} (False)`;
      }
      result.activeBuildings = { [reg]: 'source', 'PC': 'dest' };
      break;
    }
    case 'READ': {
      result.requiresInput = { register: args[0] };
      result.logMessage = `WAITING INPUT -> ${args[0]}`;
      break;
    }
    case 'HLT': {
      result.nextPC = -1;
      result.logMessage = `HALTED`;
      break;
    }
    default:
      result.isError = true;
      result.logMessage = `ILLEGAL OPCODE: ${opcode}`;
      break;
  }

  return result;
}
