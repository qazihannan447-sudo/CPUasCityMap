"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const parser_1 = require("../src/engine/parser");
const samples_1 = require("../src/engine/samples");
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
(0, node_test_1.default)('default program parses without diagnostics', () => {
    const parsed = (0, parser_1.parseProgram)(samples_1.DEFAULT_CODE);
    strict_1.default.equal(parsed.errors.length, 0);
});
(0, node_test_1.default)('sample library contains at least five programs', () => {
    strict_1.default.ok(Object.keys(samples_1.SAMPLES).length >= 5);
});
(0, node_test_1.default)('non-error demo samples parse cleanly', () => {
    for (const [name, code] of Object.entries(samples_1.SAMPLES)) {
        if (name === 'Underflow Alert')
            continue;
        const parsed = (0, parser_1.parseProgram)(code);
        strict_1.default.equal(parsed.errors.length, 0, `${name} should parse without errors`);
    }
});
(0, node_test_1.default)('samples collectively cover every proposal instruction type', () => {
    const seen = new Set();
    for (const code of Object.values(samples_1.SAMPLES)) {
        const parsed = (0, parser_1.parseProgram)(code);
        for (const instruction of parsed.instructions) {
            seen.add(instruction.opcode);
        }
    }
    for (const opcode of REQUIRED_PROPOSAL_OPCODES) {
        strict_1.default.ok(seen.has(opcode), `Expected samples to include ${opcode}`);
    }
});
