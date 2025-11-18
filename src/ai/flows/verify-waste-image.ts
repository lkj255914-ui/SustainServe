'use server';

/**
 * @fileOverview Verifies if a selected waste type matches the uploaded image.
 *
 * - verifyWasteImage - A function that verifies the waste image.
 * - VerifyWasteImageInput - The input type for the verifyWasteImage function.
 * - VerifyWasteImageOutput - The return type for the verifyWasteImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VerifyWasteImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the waste, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  wasteType: z.string().describe('The waste type selected by the user (e.g., Recyclable, Hazardous).'),
});

export type VerifyWasteImageInput = z.infer<typeof VerifyWasteImageInputSchema>;

const VerifyWasteImageOutputSchema = z.object({
    isMatch: z.boolean().describe('Whether the waste type likely matches the contents of the photo.'),
    reason: z.string().describe('A brief explanation for the decision.'),
});

export type VerifyWasteImageOutput = z.infer<typeof VerifyWasteImageOutputSchema>;

export async function verifyWasteImage(input: VerifyWasteImageInput): Promise<VerifyWasteImageOutput> {
  return verifyWasteImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'verifyWasteImagePrompt',
  input: {schema: VerifyWasteImageInputSchema},
  output: {schema: VerifyWasteImageOutputSchema},
  prompt: `You are a waste classification expert. Your task is to determine if the user's selected waste type matches the item shown in the provided photo.

User's selected waste type: '{{{wasteType}}}'
Photo of the waste: {{media url=photoDataUri}}

Analyze the photo and determine if the primary item in the image corresponds to the selected waste type.
- If it is a good match, set isMatch to true.
- If it is not a match, set isMatch to false.
- Provide a very short, one-sentence reason for your decision. For example, "The photo shows a plastic bottle, which is recyclable." or "The photo shows a battery, which is considered hazardous waste, not general waste."`,
});

const verifyWasteImageFlow = ai.defineFlow(
  {
    name: 'verifyWasteImageFlow',
    inputSchema: VerifyWasteImageInputSchema,
    outputSchema: VerifyWasteImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
