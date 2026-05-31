"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const parser_1 = require("../src/engine/parser");
(0, node_test_1.default)('parser accepts valid labels and instructions', () => {
    const parsed = (0, parser_1.parseProgram)(`
    start:
    LOADI R1 5
    ADD R1 3 R2
    JUMPIF R2 > 4 done
    done:
    HLT
  `);
    strict_1.default.equal(parsed.errors.length, 0);
    strict_1.default.equal(parsed.instructions.length, 4);
    strict_1.default.equal(parsed.labels.start, 0);
    strict_1.default.equal(parsed.labels.done, 3);
});
(0, node_test_1.default)('parser reports invalid opcode and duplicate label', () => {
    const parsed = (0, parser_1.parseProgram)(`
    loop:
    LOADI R1 1
    loop:
    MOV R1 R2
  `);
    strict_1.default.equal(parsed.errors.length, 2);
    strict_1.default.match(parsed.errors[0].message, /Duplicate label/);
    strict_1.default.match(parsed.errors[1].message, /Unknown instruction/);
});
(0, node_test_1.default)('parser validates JUMPIF operator and target', () => {
    const parsed = (0, parser_1.parseProgram)(`JUMPIF R1 <> 5 nowhere`);
    strict_1.default.equal(parsed.errors.length, 2);
    strict_1.default.match(parsed.errors[0].message, /operator/);
    strict_1.default.match(parsed.errors[1].message, /not defined/);
});
