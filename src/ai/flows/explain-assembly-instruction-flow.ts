'use server';
/**
 * @fileOverview An AI agent that explains assembly instructions or keywords.
 *
 * - explainAssemblyInstruction - A function that handles the explanation process.
 * - ExplainAssemblyInstructionInput - The input type for the explainAssemblyInstruction function.
 * - ExplainAssemblyInstructionOutput - The return type for the explainAssemblyInstruction function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainAssemblyInstructionInputSchema = z.object({
  instructionOrKeyword: z
    .string()
    .describe('The assembly instruction or keyword to explain.'),
});
export type ExplainAssemblyInstructionInput = z.infer<
  typeof ExplainAssemblyInstructionInputSchema
>;

const ExplainAssemblyInstructionOutputSchema = z.object({
  explanation: z
    .string()
    .describe('A brief explanation of the assembly instruction or keyword.'),
});
export type ExplainAssemblyInstructionOutput = z.infer<
  typeof ExplainAssemblyInstructionOutputSchema
>;

export async function explainAssemblyInstruction(
  input: ExplainAssemblyInstructionInput
): Promise<ExplainAssemblyInstructionOutput> {
  return explainAssemblyInstructionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainAssemblyInstructionPrompt',
  input: {schema: ExplainAssemblyInstructionInputSchema},
  output: {schema: ExplainAssemblyInstructionOutputSchema},
  prompt: `You are an expert computer architecture tutor. Your task is to provide a brief, concise explanation of a given assembly instruction or keyword. Focus on its purpose and typical usage.

Instruction/Keyword: {{{instructionOrKeyword}}}`,
});

const explainAssemblyInstructionFlow = ai.defineFlow(
  {
    name: 'explainAssemblyInstructionFlow',
    inputSchema: ExplainAssemblyInstructionInputSchema,
    outputSchema: ExplainAssemblyInstructionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
