"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeInstruction = executeInstruction;
function executeInstruction(instr, state) {
    const { opcode, args } = instr;
    const { registers, memory, stack, pc, labels } = state;
    const result = {
        logMessage: '',
        animations: [],
        activeBuildings: {},
        nextPC: pc + 1
    };
    const getVal = (arg) => {
        if (arg.startsWith('R'))
            return registers[arg] || 0;
        if (arg.startsWith('MEM['))
            return memory[getAddr(arg)] || 0;
        return parseInt(arg) || 0;
    };
    const getAddr = (arg) => parseInt(arg.replace('MEM[', '').replace('[', '').replace(']', ''));
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
            const parsedAddress = args[1]?.replace('MEM[', '').replace('[', '').replace(']', '') ?? '';
            const addr = parseInt(parsedAddress);
            if (isNaN(addr) || addr < 0 || addr >= memory.length) {
                result.type = 'ERROR';
                result.error = true;
                result.isError = true;
                result.errorTarget = 'RAM';
                result.nextPC = pc;
                result.logMessage = `Memory error: address ${parsedAddress} is out of bounds (valid: 0–${memory.length - 1})`;
                result.log = result.logMessage;
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
            const dest = args[0];
            const src = args[1];
            const parsedAddress = dest?.replace('MEM[', '').replace('[', '').replace(']', '') ?? '';
            const addr = parseInt(parsedAddress);
            const val = registers[src];
            if (isNaN(addr) || addr < 0 || addr >= memory.length) {
                result.type = 'ERROR';
                result.error = true;
                result.isError = true;
                result.errorTarget = 'RAM';
                result.nextPC = pc;
                result.logMessage = `Memory error: address ${parsedAddress} is out of bounds (valid: 0–${memory.length - 1})`;
                result.log = result.logMessage;
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
            const [dest, s1, s2] = args;
            const v1 = getVal(s1);
            const v2 = getVal(s2);
            let res = 0;
            if (opcode === 'ADD')
                res = v1 + v2;
            if (opcode === 'SUB')
                res = v1 - v2;
            if (opcode === 'MUL')
                res = v1 * v2;
            result.registers = { ...registers, [dest]: res };
            result.logMessage = `${dest} = ${v1} ${opcode === 'ADD' ? '+' : opcode === 'SUB' ? '-' : '*'} ${v2} = ${res}`;
            result.activeBuildings = { [s1]: 'source', [s2]: 'source', 'ALU': 'dest', [dest]: 'dest' };
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
                result.errorTarget = 'STACK';
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
            const labelName = args[0];
            const targetLine = labels[labelName];
            if (targetLine === undefined || targetLine === null) {
                result.type = 'ERROR';
                result.error = true;
                result.isError = true;
                result.errorTarget = 'PC';
                result.nextPC = pc;
                result.logMessage = `JUMP error: label "${labelName}" not found in program`;
                result.log = result.logMessage;
                result.activeBuildings = { 'PC': 'error' };
                break;
            }
            result.nextPC = targetLine;
            result.logMessage = `JMP -> ${labelName}`;
            result.activeBuildings = { 'PC': 'dest' };
            result.animationSpec = { from: 'pc', to: 'pc', label: labelName, color: '#888888', type: 'jump' };
            break;
        }
        case 'JUMPIF': {
            // Syntax: JUMPIF R1 < 5 label
            const [reg, operator, rawVal, label] = args;
            const op = operator;
            const compareVal = isNaN(Number(rawVal)) ? (registers[rawVal] ?? 0) : Number(rawVal);
            const regVal = registers[reg] ?? 0;
            let condition = false;
            if (operator === '>')
                condition = regVal > compareVal;
            if (operator === '<')
                condition = regVal < compareVal;
            if (operator === '>=')
                condition = regVal >= compareVal;
            if (operator === '<=')
                condition = regVal <= compareVal;
            if (operator === '==')
                condition = regVal === compareVal;
            if (operator === '!=')
                condition = regVal !== compareVal;
            const val = compareVal;
            if (condition) {
                const targetLine = labels[label];
                if (targetLine === undefined || targetLine === null) {
                    result.type = 'ERROR';
                    result.error = true;
                    result.isError = true;
                    result.errorTarget = 'PC';
                    result.nextPC = pc;
                    result.logMessage = `JUMP error: label "${label}" not found in program`;
                    result.log = result.logMessage;
                    result.activeBuildings = { 'PC': 'error' };
                    break;
                }
                result.nextPC = targetLine;
                result.logMessage = `IF ${regVal} ${op} ${val} (True) -> JMP ${label}`;
            }
            else {
                result.logMessage = `IF ${regVal} ${op} ${val} (False)`;
            }
            result.activeBuildings = { [reg]: 'source', 'PC': 'dest' };
            result.animationSpec = {
                from: reg.toLowerCase(),
                to: condition ? 'pc' : reg.toLowerCase(),
                label: condition ? 'JUMP' : 'skip',
                color: condition ? '#EF9F27' : '#aaaaaa',
                type: 'jumpif'
            };
            break;
        }
        case 'READ': {
            result.requiresInput = { register: args[0] };
            result.logMessage = `WAITING INPUT -> ${args[0]}`;
            result.animationSpec = { from: 'pc', to: args[0].toLowerCase(), label: '', color: '#534AB7', type: 'read' };
            break;
        }
        case 'HLT': {
            result.nextPC = -1;
            result.halted = true;
            result.logMessage = `HLT: program halted`;
            break;
        }
        default:
            result.isError = true;
            result.errorTarget = 'EDITOR';
            result.logMessage = `ILLEGAL OPCODE: ${opcode}`;
            break;
    }
    return result;
}
