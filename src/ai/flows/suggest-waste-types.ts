'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting waste types based on uploaded photos.
 *
 * The flow uses an AI model to analyze the image and provide a list of possible waste types.
 *
 * @exports {
 *   suggestWasteTypes,
 *   SuggestWasteTypesInput,
 *   SuggestWasteTypesOutput,
 * }
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestWasteTypesInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      'A photo of the waste, as a data URI that must include a MIME type and use Base64 encoding. Expected format: data:<mimetype>;base64,<encoded_data>.'
    ),
});
export type SuggestWasteTypesInput = z.infer<typeof SuggestWasteTypesInputSchema>;

const SuggestWasteTypesOutputSchema = z.object({
  wasteTypes: z
    .array(z.string())
    .describe('A list of suggested waste types based on the photo.'),
});
export type SuggestWasteTypesOutput = z.infer<typeof SuggestWasteTypesOutputSchema>;

export async function suggestWasteTypes(input: SuggestWasteTypesInput): Promise<SuggestWasteTypesOutput> {
  return suggestWasteTypesFlow(input);
}

const suggestWasteTypesPrompt = ai.definePrompt({
  name: 'suggestWasteTypesPrompt',
  input: {schema: SuggestWasteTypesInputSchema},
  output: {schema: SuggestWasteTypesOutputSchema},
  prompt: `You are an AI assistant that suggests waste types based on an image.

  Analyze the following image of waste and provide a list of possible waste types.
  Respond with a list of waste types that best describes the image.

  Image: {{media url=photoDataUri}}
  Waste Types:`,
});

const suggestWasteTypesFlow = ai.defineFlow(
  {
    name: 'suggestWasteTypesFlow',
    inputSchema: SuggestWasteTypesInputSchema,
    outputSchema: SuggestWasteTypesOutputSchema,
  },
  async input => {
    const {output} = await suggestWasteTypesPrompt(input);
    return output!;
  }
);
