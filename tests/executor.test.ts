import test from 'node:test';
import assert from 'node:assert/strict';
import { executeInstruction } from '../src/engine/executor';
import type { Instruction } from '../src/engine/parser';

const baseState = () => ({
  registers: { R0: 0, R1: 0, R2: 0, R3: 0, R4: 0, R5: 0 },
  memory: Array(16).fill(null) as (number | null)[],
  stack: [] as number[],
  pc: 0,
  labels: { loop: 2, done: 4 },
});

function instruction(opcode: string, args: string[] = []): Instruction {
  return { opcode, args, line: 0, raw: [opcode, ...args].join(' ') };
}

test('executor performs arithmetic and writes destination register', () => {
  const state = baseState();
  state.registers.R2 = 8;
  state.registers.R5 = 4;

  const result = executeInstruction(instruction('ADD', ['R4', 'R2', 'R5']), state);

  assert.equal(result.registers?.R4, 12);
  assert.equal(result.animations.length, 3);
  assert.match(result.logMessage, /R4 = 8 \+ 4 = 12/);
});

test('executor writes and reads memory correctly', () => {
  const writeState = baseState();
  writeState.registers.R3 = 9;
  const storeResult = executeInstruction(instruction('STORE', ['MEM[2]', 'R3']), writeState);

  assert.equal(storeResult.memory?.[2], 9);

  const readState = baseState();
  readState.memory[2] = 9;
  const loadResult = executeInstruction(instruction('LOAD', ['R4', 'MEM[2]']), readState);

  assert.equal(loadResult.registers?.R4, 9);
});

test('executor reports stack underflow', () => {
  const result = executeInstruction(instruction('POP', ['R1']), baseState());

  assert.equal(result.isError, true);
  assert.equal(result.errorTarget, 'STACK');
  assert.match(result.logMessage, /UNDERFLOW/);
});

test('executor reports out-of-bounds memory access', () => {
  const state = baseState();
  state.registers.R1 = 4;
  const result = executeInstruction(instruction('STORE', ['MEM[99]', 'R1']), state);

  assert.equal(result.isError, true);
  assert.equal(result.errorTarget, 'RAM');
  assert.match(result.logMessage, /out of bounds/);
});

test('executor resolves conditional jump when true', () => {
  const state = baseState();
  state.registers.R1 = 6;
  const result = executeInstruction(instruction('JUMPIF', ['R1', '>', '5', 'loop']), state);

  assert.equal(result.nextPC, 2);
  assert.match(result.logMessage, /\(True\)/);
});
