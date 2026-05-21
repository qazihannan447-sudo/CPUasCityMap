
export interface Instruction {
  opcode: string;
  args: string[];
  line: number;
  raw: string;
}

export interface ParsedProgram {
  instructions: Instruction[];
  labels: Record<string, number>;
}

export function parseProgram(code: string): ParsedProgram {
  const lines = code.split('\n');
  const instructions: Instruction[] = [];
  const labels: Record<string, number> = {};

  let currentPC = 0;
  lines.forEach((line, index) => {
    const trimmed = line.split('#')[0].trim();
    if (!trimmed) return;

    if (trimmed.endsWith(':')) {
      const labelName = trimmed.slice(0, -1);
      labels[labelName] = currentPC;
    } else {
      const parts = trimmed.split(/\s+/).map(p => p.replace(',', ''));
      instructions.push({
        opcode: parts[0].toUpperCase(),
        args: parts.slice(1),
        line: index,
        raw: trimmed
      });
      currentPC++;
    }
  });

  return { instructions, labels };
}
