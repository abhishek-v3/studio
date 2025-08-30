'use server';

/**
 * @fileOverview A student ability assessment AI agent.
 *
 * - assessStudentAbility - A function that handles the assessment process.
 * - AssessStudentAbilityInput - The input type for the assessStudentAbility function.
 * - AssessStudentAbilityOutput - The return type for the assessStudentAbility function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AssessStudentAbilityInputSchema = z.object({
  pastAnswers: z
    .array(z.object({
      question: z.string(),
      answer: z.string(),
      isCorrect: z.boolean(),
    }))
    .describe('An array of past quiz answers, including the question, answer, and whether the answer was correct.'),
});
export type AssessStudentAbilityInput = z.infer<typeof AssessStudentAbilityInputSchema>;

const AssessStudentAbilityOutputSchema = z.object({
  abilityEstimate: z.string().describe('An estimate of the student\'s current ability level.'),
  difficultyRecommendation: z
    .string()
    .describe('A recommendation for the difficulty of future questions.'),
});
export type AssessStudentAbilityOutput = z.infer<typeof AssessStudentAbilityOutputSchema>;

export async function assessStudentAbility(input: AssessStudentAbilityInput): Promise<AssessStudentAbilityOutput> {
  return assessStudentAbilityFlow(input);
}

const prompt = ai.definePrompt({
  name: 'assessStudentAbilityPrompt',
  input: {schema: AssessStudentAbilityInputSchema},
  output: {schema: AssessStudentAbilityOutputSchema},
  prompt: `You are an AI assistant that assesses a student's ability based on their past quiz answers.

You will receive an array of past answers, including the question, the student's answer, and whether the answer was correct.

Based on this information, you will provide an estimate of the student's current ability level and a recommendation for the difficulty of future questions.

Past Answers:
{{#each pastAnswers}}
Question: {{{question}}}
Answer: {{{answer}}}
Correct: {{isCorrect}}
{{/each}}

Ability Estimate: {{{abilityEstimate}}}
Difficulty Recommendation: {{{difficultyRecommendation}}}`, // Ensure Handlebars syntax is correct
});

const assessStudentAbilityFlow = ai.defineFlow(
  {
    name: 'assessStudentAbilityFlow',
    inputSchema: AssessStudentAbilityInputSchema,
    outputSchema: AssessStudentAbilityOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
