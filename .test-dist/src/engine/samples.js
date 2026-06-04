"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SAMPLES = exports.DEFAULT_CODE = void 0;
exports.DEFAULT_CODE = `# CPU City tour
LOADI R1 8
LOADI R2 4
STORE R1 MEM[0]
STORE R2 MEM[1]
LOAD R3 MEM[0]
PUSH R3
POP R5
ADD R4 R2 R5`;
exports.SAMPLES = {
    'Arithmetic District': `# LOADI + ADD + SUB + MUL
LOADI R1 7
LOADI R2 3
ADD R3 R1 R2
SUB R4 R3 R2
MUL R5 R4 R2`,
    'Memory Warehouse': `# STORE + LOAD
LOADI R1 10
LOADI R2 20
STORE R1 MEM[0]
STORE R2 MEM[1]
LOAD R3 MEM[0]
LOAD R4 MEM[1]
ADD R5 R3 R4`,
    'Stack Garage': `# PUSH + POP
LOADI R1 5
LOADI R2 8
PUSH R1
PUSH R2
POP R3
POP R4`,
    'Loop Junction': `# JUMP + JUMPIF
LOADI R1 0
LOADI R2 1
JUMP loop
skip:
LOADI R5 99
loop:
ADD R1 R1 R2
JUMPIF R1 < 5 loop`,
    'Input Signal': `# READ
READ R1
READ R2
ADD R3 R1 R2
STORE R3 MEM[0]
HLT`,
    'Signal Relay Grid': `# READ + math + memory + stack + branching
READ R1
READ R2
ADD R3 R1 R2
STORE R3 MEM[0]
PUSH R1
PUSH R2
POP R4
POP R5
MUL R0 R4 R5
STORE R0 MEM[1]
LOAD R2 MEM[0]
LOAD R3 MEM[1]
SUB R4 R3 R2
JUMPIF R4 > 50 amplify
ADD R5 R4 5
JUMP finish
amplify:
MUL R5 R4 2
finish:
STORE R5 MEM[2]
HLT`,
    'Factory Shift Cycle': `# Looping pass through every core district
READ R0
LOADI R1 1
LOADI R2 4
loop:
ADD R0 R0 R1
STORE R0 MEM[1]
PUSH R0
ADD R1 R1 1
JUMPIF R1 <= R2 loop
POP R3
POP R4
LOAD R5 MEM[1]
MUL R2 R3 R4
SUB R1 R2 R5
JUMPIF R1 != 0 adjust
JUMP done
adjust:
ADD R0 R1 R5
STORE R0 MEM[3]
done:
HLT`,
    'Underflow Alert': `# Deliberate error demo for presentation
POP R1
HLT`,
};
