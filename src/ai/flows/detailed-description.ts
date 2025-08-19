'use server';
/**
 * @fileOverview AI agent that provides detailed descriptions of locations.
 *
 * - generateDetailedDescription - A function that generates a detailed description for a given location.
 * - DetailedDescriptionInput - The input type for the generateDetailedDescription function.
 * - DetailedDescriptionOutput - The return type for the generateDetailedDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetailedDescriptionInputSchema = z.object({
  locationType: z.string().describe('The type of location (e.g., restaurant, hotel, hospital).'),
  locationName: z.string().describe('The name of the location.'),
  locationAddress: z.string().describe('The address of the location.'),
  additionalInfo: z.string().optional().describe('Any additional information about the location.'),
});
export type DetailedDescriptionInput = z.infer<typeof DetailedDescriptionInputSchema>;

const DetailedDescriptionOutputSchema = z.object({
  detailedDescription: z.string().describe('A detailed description of the location, including its address and other relevant information.'),
});
export type DetailedDescriptionOutput = z.infer<typeof DetailedDescriptionOutputSchema>;

export async function generateDetailedDescription(input: DetailedDescriptionInput): Promise<DetailedDescriptionOutput> {
  return detailedDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detailedDescriptionPrompt',
  input: {schema: DetailedDescriptionInputSchema},
  output: {schema: DetailedDescriptionOutputSchema},
  prompt: `You are an AI assistant that provides detailed descriptions of locations.

You will receive the location type, name, address, and any additional information about the location.
Your task is to generate a comprehensive description that includes the address and other relevant details, such as menu highlights for restaurants or amenities for hotels.

Location Type: {{{locationType}}}
Location Name: {{{locationName}}}
Location Address: {{{locationAddress}}}
Additional Info: {{{additionalInfo}}}

Detailed Description:`,
});

const detailedDescriptionFlow = ai.defineFlow(
  {
    name: 'detailedDescriptionFlow',
    inputSchema: DetailedDescriptionInputSchema,
    outputSchema: DetailedDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
