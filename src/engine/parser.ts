
export interface Instruction {
  opcode: string;
  args: string[];
  line: number;
  raw: string;
}

export interface ProgramDiagnostic {
  line: number;
  message: string;
  raw: string;
}

export interface ParsedProgram {
  instructions: Instruction[];
  labels: Record<string, number>;
  errors: ProgramDiagnostic[];
}

export function parseProgram(code: string): ParsedProgram {
  const lines = code.split('\n');
  const instructions: Instruction[] = [];
  const labels: Record<string, number> = {};
  const errors: ProgramDiagnostic[] = [];

  let currentPC = 0;
  lines.forEach((line, index) => {
    const trimmed = line.split('#')[0].trim();
    if (!trimmed) return;

    if (trimmed.endsWith(':')) {
      const labelName = trimmed.slice(0, -1);
      if (!labelName) {
        errors.push({
          line: index,
          message: 'Label name is missing before the colon.',
          raw: trimmed,
        });
        return;
      }
      if (labels[labelName] !== undefined) {
        errors.push({
          line: index,
          message: `Duplicate label "${labelName}".`,
          raw: trimmed,
        });
        return;
      }
      labels[labelName] = currentPC;
    } else {
      const parts = trimmed.split(/\s+/).map(p => p.replace(',', ''));
      const instruction: Instruction = {
        opcode: parts[0].toUpperCase(),
        args: parts.slice(1),
        line: index,
        raw: trimmed
      };
      instructions.push(instruction);
      currentPC++;
    }
  });

  instructions.forEach((instruction) => {
    errors.push(...validateInstruction(instruction, labels));
  });

  return { instructions, labels, errors };
}

const VALID_OPERATORS = new Set(['>', '<', '>=', '<=', '==', '!=']);
const REGISTER_PATTERN = /^R[0-5]$/;
const MEMORY_PATTERN = /^MEM\[(\d+)\]$/;
const INTEGER_PATTERN = /^-?\d+$/;
const SUPPORTED_OPCODES = new Set([
  'LOADI',
  'LOAD',
  'STORE',
  'ADD',
  'SUB',
  'MUL',
  'PUSH',
  'POP',
  'JUMP',
  'JUMPIF',
  'READ',
  'HLT',
]);

function validateInstruction(instruction: Instruction, labels: Record<string, number>): ProgramDiagnostic[] {
  const { opcode, args, line, raw } = instruction;
  const diagnostics: ProgramDiagnostic[] = [];

  if (!SUPPORTED_OPCODES.has(opcode)) {
    diagnostics.push({
      line,
      raw,
      message: `Unknown instruction "${opcode}".`,
    });
    return diagnostics;
  }

  const expectArgs = (count: number) => {
    if (args.length !== count) {
      diagnostics.push({
        line,
        raw,
        message: `${opcode} expects ${count} argument${count === 1 ? '' : 's'}, received ${args.length}.`,
      });
      return false;
    }
    return true;
  };

  const ensureRegister = (value: string, label: string) => {
    if (!REGISTER_PATTERN.test(value)) {
      diagnostics.push({
        line,
        raw,
        message: `${label} must be one of R0-R5.`,
      });
    }
  };

  const ensureMemory = (value: string, label: string) => {
    if (!MEMORY_PATTERN.test(value)) {
      diagnostics.push({
        line,
        raw,
        message: `${label} must use MEM[address] syntax.`,
      });
    }
  };

  const ensureInteger = (value: string, label: string) => {
    if (!INTEGER_PATTERN.test(value)) {
      diagnostics.push({
        line,
        raw,
        message: `${label} must be an integer value.`,
      });
    }
  };

  const ensureValue = (value: string, label: string) => {
    if (!REGISTER_PATTERN.test(value) && !MEMORY_PATTERN.test(value) && !INTEGER_PATTERN.test(value)) {
      diagnostics.push({
        line,
        raw,
        message: `${label} must be a register, integer, or MEM[address].`,
      });
    }
  };

  switch (opcode) {
    case 'LOADI':
      if (expectArgs(2)) {
        ensureRegister(args[0], 'Destination register');
        ensureInteger(args[1], 'Immediate value');
      }
      break;
    case 'LOAD':
      if (expectArgs(2)) {
        ensureRegister(args[0], 'Destination register');
        ensureMemory(args[1], 'Memory operand');
      }
      break;
    case 'STORE':
      if (expectArgs(2)) {
        ensureMemory(args[0], 'Destination memory');
        ensureRegister(args[1], 'Source register');
      }
      break;
    case 'ADD':
    case 'SUB':
    case 'MUL':
      if (expectArgs(3)) {
        ensureRegister(args[0], 'Destination register');
        ensureValue(args[1], 'First operand');
        ensureValue(args[2], 'Second operand');
      }
      break;
    case 'PUSH':
      if (expectArgs(1)) {
        ensureRegister(args[0], 'Source register');
      }
      break;
    case 'POP':
      if (expectArgs(1)) {
        ensureRegister(args[0], 'Destination register');
      }
      break;
    case 'JUMP':
      if (expectArgs(1) && labels[args[0]] === undefined) {
        diagnostics.push({
          line,
          raw,
          message: `Jump target "${args[0]}" is not defined.`,
        });
      }
      break;
    case 'JUMPIF':
      if (expectArgs(4)) {
        ensureRegister(args[0], 'Conditional register');
        if (!VALID_OPERATORS.has(args[1])) {
          diagnostics.push({
            line,
            raw,
            message: 'JUMPIF operator must be one of >, <, >=, <=, ==, !=.',
          });
        }
        if (!REGISTER_PATTERN.test(args[2]) && !INTEGER_PATTERN.test(args[2])) {
          diagnostics.push({
            line,
            raw,
            message: 'JUMPIF comparison value must be a register or integer.',
          });
        }
        if (labels[args[3]] === undefined) {
          diagnostics.push({
            line,
            raw,
            message: `Jump target "${args[3]}" is not defined.`,
          });
        }
      }
      break;
    case 'READ':
      if (expectArgs(1)) {
        ensureRegister(args[0], 'Destination register');
      }
      break;
    case 'HLT':
      expectArgs(0);
      break;
  }

  return diagnostics;
}
