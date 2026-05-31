import test from 'node:test';
import assert from 'node:assert/strict';
import { parseProgram } from '../src/engine/parser';
import { DEFAULT_CODE, SAMPLES } from '../src/engine/samples';

const REQUIRED_PROPOSAL_OPCODES = [
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
];

test('default program parses without diagnostics', () => {
  const parsed = parseProgram(DEFAULT_CODE);
  assert.equal(parsed.errors.length, 0);
});

test('sample library contains at least five programs', () => {
  assert.ok(Object.keys(SAMPLES).length >= 5);
});

test('non-error demo samples parse cleanly', () => {
  for (const [name, code] of Object.entries(SAMPLES)) {
    if (name === 'Underflow Alert') continue;
    const parsed = parseProgram(code);
    assert.equal(parsed.errors.length, 0, `${name} should parse without errors`);
  }
});

test('samples collectively cover every proposal instruction type', () => {
  const seen = new Set<string>();

  for (const code of Object.values(SAMPLES)) {
    const parsed = parseProgram(code);
    for (const instruction of parsed.instructions) {
      seen.add(instruction.opcode);
    }
  }

  for (const opcode of REQUIRED_PROPOSAL_OPCODES) {
    assert.ok(seen.has(opcode), `Expected samples to include ${opcode}`);
  }
});
