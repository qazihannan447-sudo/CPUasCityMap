import test from 'node:test';
import assert from 'node:assert/strict';
import { parseProgram } from '../src/engine/parser';

test('parser accepts valid labels and instructions', () => {
  const parsed = parseProgram(`
    start:
    LOADI R2 5
    ADD R4 R2 3
    JUMPIF R4 > 4 done
    done:
    HLT
  `);

  assert.equal(parsed.errors.length, 0);
  assert.equal(parsed.instructions.length, 4);
  assert.equal(parsed.labels.start, 0);
  assert.equal(parsed.labels.done, 3);
});

test('parser reports invalid opcode and duplicate label', () => {
  const parsed = parseProgram(`
    loop:
    LOADI R1 1
    loop:
    MOV R1 R2
  `);

  assert.equal(parsed.errors.length, 2);
  assert.match(parsed.errors[0].message, /Duplicate label/);
  assert.match(parsed.errors[1].message, /Unknown instruction/);
});

test('parser validates JUMPIF operator and target', () => {
  const parsed = parseProgram(`JUMPIF R1 <> 5 nowhere`);

  assert.equal(parsed.errors.length, 2);
  assert.match(parsed.errors[0].message, /operator/);
  assert.match(parsed.errors[1].message, /not defined/);
});
