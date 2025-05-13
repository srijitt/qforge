'use server';

/**
 * @fileOverview A flow for generating probable questions based on a given syllabus.
 *
 * - generateProbableQuestions - A function that takes syllabus input (PDF or text) and returns a list of AI-curated probable questions.
 * - GenerateProbableQuestionsInput - The input type for the generateProbableQuestions function.
 * - GenerateProbableQuestionsOutput - The return type for the generateProbableQuestions function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GenerateProbableQuestionsInputSchema = z.object({
  syllabus: z.string().describe('The syllabus for which to generate probable questions.  This can be in text format or a data URI for a PDF document.'),
  board: z.string().describe('The education board (e.g., CBSE, ICSE, State Board).'),
  classLevel: z.string().describe('The class level (e.g., 1, 2, ..., 12).'),
  subject: z.string().describe('The subject (e.g., Math, Science, Social Studies).'),
});

export type GenerateProbableQuestionsInput = z.infer<typeof GenerateProbableQuestionsInputSchema>;

const GenerateProbableQuestionsOutputSchema = z.object({
  questions: z.array(z.string()).describe('A list of AI-curated probable questions based on the syllabus.'),
});

export type GenerateProbableQuestionsOutput = z.infer<typeof GenerateProbableQuestionsOutputSchema>;

export async function generateProbableQuestions(
  input: GenerateProbableQuestionsInput
): Promise<GenerateProbableQuestionsOutput> {
  return generateProbableQuestionsFlow(input);
}

const generateProbableQuestionsPrompt = ai.definePrompt({
  name: 'generateProbableQuestionsPrompt',
  input: {
    schema: z.object({
      syllabus: z.string().describe('The syllabus for which to generate probable questions.'),
      board: z.string().describe('The education board.'),
      classLevel: z.string().describe('The class level.'),
      subject: z.string().describe('The subject.'),
    }),
  },
  output: {
    schema: z.object({
      questions: z.array(z.string()).describe('A list of probable questions.'),
    }),
  },
  prompt: `You are an expert teacher specializing in creating question papers for various education boards and classes. Based on the given syllabus, board, class level, and subject, generate a list of probable questions. Do not write fillers like "**Question:**", or similar.

IMPORTANT: For any mathematical formulas, equations, or symbols, you MUST use LaTeX syntax enclosed in delimiters.
Use single dollar signs ($...$) for inline math and double dollar signs ($$...$$) for display math (equations on their own line).

Examples:
- Inline: The formula for the area of a circle is $A = \pi r^2$. A fraction $\frac{a}{b}$ is written like this. For $\sin 3\theta$ in terms of $\sin \theta$, write $ \sin 3\theta = 3\sin\theta - 4\sin^3\theta $.
- Display math:
$$ \int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2} $$
- Matrices: For a 2x2 matrix, use environments like 'pmatrix', 'bmatrix', or 'array'. Ensure elements are clearly separated:
$$
M = \begin{bmatrix} 1 & 2 \\ 3 & 4 \end{bmatrix} \quad \text{or} \quad R(\theta) = \begin{pmatrix} \cos\theta & -\sin\theta \\ \sin\theta & \cos\theta \end{pmatrix}
$$
- Tables: For simple tables, use the 'array' environment within display math. Ensure columns are well-defined and use \text{} for textual content within cells for clarity.
$$
\begin{array}{||c|c|c||} 
\hline 
\text{Property} & \text{Value A} & \text{Value B} \\ 
\hline\hline 
\text{Mass (kg)} & m_A & m_B \\ 
\hline 
\text{Velocity (m/s)} & v_A & v_B \\ 
\hline 
\end{array}
$$

Ensure all mathematical content is correctly formatted using these LaTeX delimiters. Make sure fractions are clearly distinguishable (e.g., using $\\frac{numerator}{denominator}$ or $\\dfrac{numerator}{denominator}$ for display style fractions, especially for complex fractions, to ensure they are easily readable by students). Ensure symbols are standard and unambiguous.

Syllabus: {{{syllabus}}}
Board: {{{board}}}
Class Level: {{{classLevel}}}
Subject: {{{subject}}}

Questions:`, // Use Handlebars templating
});

const generateProbableQuestionsFlow = ai.defineFlow<
  typeof GenerateProbableQuestionsInputSchema,
  typeof GenerateProbableQuestionsOutputSchema
>(
  {
    name: 'generateProbableQuestionsFlow',
    inputSchema: GenerateProbableQuestionsInputSchema,
    outputSchema: GenerateProbableQuestionsOutputSchema,
  },
  async input => {
    const {output} = await generateProbableQuestionsPrompt(input);
    // Post-processing (optional): Validate or clean up the LaTeX delimiters if needed.
    // For now, we assume the AI follows instructions.
    return output!;
  }
);

