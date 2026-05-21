'use server';
/**
 * @fileOverview A Genkit flow for generating assembly-like code from a natural language description.
 *
 * - generateAssemblyCode - A function that handles the assembly code generation process.
 * - GenerateAssemblyCodeInput - The input type for the generateAssemblyCode function.
 * - GenerateAssemblyCodeOutput - The return type for the generateAssemblyCode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAssemblyCodeInputSchema = z.object({
  description: z
    .string()
    .describe('A natural language description of the algorithm to convert into assembly code.'),
});
export type GenerateAssemblyCodeInput = z.infer<typeof GenerateAssemblyCodeInputSchema>;

const GenerateAssemblyCodeOutputSchema = z.object({
  assemblyCode: z
    .string()
    .describe('The generated assembly-like code for the given algorithm. Only the code, no extra text or markdown.'),
});
export type GenerateAssemblyCodeOutput = z.infer<typeof GenerateAssemblyCodeOutputSchema>;

export async function generateAssemblyCode(
  input: GenerateAssemblyCodeInput
): Promise<GenerateAssemblyCodeOutput> {
  return generateAssemblyCodeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAssemblyCodePrompt',
  input: {schema: GenerateAssemblyCodeInputSchema},
  output: {schema: GenerateAssemblyCodeOutputSchema},
  prompt: `You are an expert assembly language programmer for a simplified CPU architecture.
Your task is to convert a natural language description of an algorithm into assembly-like code.

The CPU has general-purpose registers (R0, R1, R2, ..., R7), memory (accessed with [address]), and a stack (PUSH, POP).
Common instructions include:
- MOV Rx, <value> (Move value to register Rx)
- MOV Rx, Ry (Move value from Ry to Rx)
- ADD Rx, Ry, Rz (Add Ry and Rz, store in Rx)
- SUB Rx, Ry, Rz (Subtract Rz from Ry, store in Rx)
- MUL Rx, Ry, Rz (Multiply Ry and Rz, store in Rx)
- DIV Rx, Ry, Rz (Divide Ry by Rz, store in Rx)
- LOAD Rx, [address] (Load value from memory at address into Rx)
- STORE Rx, [address] (Store value from Rx into memory at address)
- PUSH Rx (Push value from Rx onto the stack)
- POP Rx (Pop value from stack into Rx)
- JMP <label> (Unconditional jump to label)
- CMP Rx, Ry (Compare Rx and Ry, sets flags)
- JE <label> (Jump if equal)
- JNE <label> (Jump if not equal)
- JG <label> (Jump if greater)
- JL <label> (Jump if less)
- JGE <label> (Jump if greater or equal)
- JLE <label> (Jump if less or equal)
- HLT (Halt execution)

Provide only the assembly code in the output, without any additional explanations, comments, or markdown formatting (e.g., no '\`\`\`assembly' or '\`\`\`'). Each instruction should be on a new line.

Algorithm description: {{{description}}}`,
});

const generateAssemblyCodeFlow = ai.defineFlow(
  {
    name: 'generateAssemblyCodeFlow',
    inputSchema: GenerateAssemblyCodeInputSchema,
    outputSchema: GenerateAssemblyCodeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate assembly code.');
    }
    return output;
  }
);
