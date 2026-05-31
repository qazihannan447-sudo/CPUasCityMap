"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const executor_1 = require("../src/engine/executor");
const baseState = () => ({
    registers: { R0: 0, R1: 0, R2: 0, R3: 0, R4: 0, R5: 0 },
    memory: Array(16).fill(null),
    stack: [],
    pc: 0,
    labels: { loop: 2, done: 4 },
});
function instruction(opcode, args = []) {
    return { opcode, args, line: 0, raw: [opcode, ...args].join(' ') };
}
(0, node_test_1.default)('executor performs arithmetic and writes destination register', () => {
    const state = baseState();
    state.registers.R1 = 7;
    const result = (0, executor_1.executeInstruction)(instruction('ADD', ['R1', '5', 'R2']), state);
    strict_1.default.equal(result.registers?.R2, 12);
    strict_1.default.equal(result.animations.length, 3);
    strict_1.default.match(result.logMessage, /R2 = 7 \+ 5 = 12/);
});
(0, node_test_1.default)('executor writes and reads memory correctly', () => {
    const writeState = baseState();
    writeState.registers.R3 = 9;
    const storeResult = (0, executor_1.executeInstruction)(instruction('STORE', ['R3', 'MEM[2]']), writeState);
    strict_1.default.equal(storeResult.memory?.[2], 9);
    const readState = baseState();
    readState.memory[2] = 9;
    const loadResult = (0, executor_1.executeInstruction)(instruction('LOAD', ['R4', 'MEM[2]']), readState);
    strict_1.default.equal(loadResult.registers?.R4, 9);
});
(0, node_test_1.default)('executor reports stack underflow', () => {
    const result = (0, executor_1.executeInstruction)(instruction('POP', ['R1']), baseState());
    strict_1.default.equal(result.isError, true);
    strict_1.default.equal(result.errorTarget, 'STACK');
    strict_1.default.match(result.logMessage, /UNDERFLOW/);
});
(0, node_test_1.default)('executor reports out-of-bounds memory access', () => {
    const state = baseState();
    state.registers.R1 = 4;
    const result = (0, executor_1.executeInstruction)(instruction('STORE', ['R1', 'MEM[99]']), state);
    strict_1.default.equal(result.isError, true);
    strict_1.default.equal(result.errorTarget, 'RAM');
    strict_1.default.match(result.logMessage, /out of bounds/);
});
(0, node_test_1.default)('executor resolves conditional jump when true', () => {
    const state = baseState();
    state.registers.R1 = 6;
    const result = (0, executor_1.executeInstruction)(instruction('JUMPIF', ['R1', '>', '5', 'loop']), state);
    strict_1.default.equal(result.nextPC, 2);
    strict_1.default.match(result.logMessage, /\(True\)/);
});
