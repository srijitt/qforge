'use server';

/**
 * @fileOverview This file defines a Genkit flow to find past year questions (PYQs) related to a specific topic and board by searching the internet.
 *
 * - findPastYearQuestions - A function that handles the process of finding PYQs.
 * - FindPastYearQuestionsInput - The input type for the findPastYearQuestions function.
 * - FindPastYearQuestionsOutput - The return type for the findPastYearQuestions function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const FindPastYearQuestionsInputSchema = z.object({
  topic: z.string().describe('The topic for which to find past year questions.'),
  board: z.string().describe('The education board (e.g., CBSE, ICSE) for which to find PYQs.'),
});
export type FindPastYearQuestionsInput = z.infer<typeof FindPastYearQuestionsInputSchema>;

const FindPastYearQuestionsOutputSchema = z.object({
  questions: z.array(z.string()).describe('An array of past year questions found on the internet.'),
});
export type FindPastYearQuestionsOutput = z.infer<typeof FindPastYearQuestionsOutputSchema>;

export async function findPastYearQuestions(input: FindPastYearQuestionsInput): Promise<FindPastYearQuestionsOutput> {
  return findPastYearQuestionsFlow(input);
}

const findPastYearQuestionsPrompt = ai.definePrompt({
  name: 'findPastYearQuestionsPrompt',
  input: {
    schema: z.object({
      topic: z.string().describe('The topic for which to find past year questions.'),
      board: z.string().describe('The education board (e.g., CBSE, ICSE).'),
    }),
  },
  output: {
    schema: z.object({
      questions: z.array(z.string()).describe('An array of past year questions found on the internet.'),
    }),
  },
  prompt: `You are an expert educator helping teachers create question papers.
Your task is to search the internet and find past year questions (PYQs) related to the given topic and specific education board.
Return a list of questions that are relevant to the topic and the board. Be sure to include the source of the question if available. Do not mention the source, just "(PYQ)"

IMPORTANT: For any mathematical formulas, equations, or symbols found in the questions, you MUST format them using LaTeX syntax enclosed in delimiters.
Use single dollar signs ($...$) for inline math and double dollar signs ($$...$$) for display math (equations on their own line).

Examples:
- Inline: The equation is $E = mc^2$. A fraction $\\frac{a}{b}$ is written like this. To express $\\sin 3\\theta$ in terms of $\\sin \\theta$, you might write $ \\sin 3\\theta = 3\\sin\\theta - 4\\sin^3\\theta $.
- Display math:
$$ \\sum_{i=1}^{n} i = \\frac{n(n+1)}{2} $$
- Matrices: For a 2x2 matrix, use environments like 'pmatrix', 'bmatrix', or 'array':
$$
A = \\begin{pmatrix} a & b \\ c & d \\end{pmatrix} \\quad \\text{or} \\quad B = \\begin{bmatrix} \\cos\\theta & -\\sin\\theta \\ \\sin\\theta & \\cos\\theta \\end{bmatrix}
$$
- Tables: For simple tables, use the 'array' environment within display math. Ensure cell contents are appropriately formatted.
$$
\\begin{array}{|c|c|c|} 
\\hline 
\\text{Column 1} & \\text{Column 2} & \\text{Column 3} \\ 
\\hline 
x_1 & y_1 & z_1 \\ 
\\hline 
x_2 & y_2 & z_2 \\ 
\\hline 
\\end{array}
$$

Ensure all mathematical content in the questions you find is correctly formatted using these LaTeX delimiters. If the original source does not use LaTeX, convert it. Make sure fractions are clearly distinguishable (e.g., using $\\frac{}{}$ or $\\dfrac{}{}$ for display style fractions if needed for clarity).

Topic: {{{topic}}}
Board: {{{board}}}

Questions:
  `,
});

const findPastYearQuestionsFlow = ai.defineFlow<
  typeof FindPastYearQuestionsInputSchema,
  typeof FindPastYearQuestionsOutputSchema
>({
  name: 'findPastYearQuestionsFlow',
  inputSchema: FindPastYearQuestionsInputSchema,
  outputSchema: FindPastYearQuestionsOutputSchema,
}, async input => {
  const {output} = await findPastYearQuestionsPrompt(input);
  // Post-processing (optional): Validate or clean up the LaTeX delimiters if needed.
  return output!;
});
