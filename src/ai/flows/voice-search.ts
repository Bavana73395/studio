// 'use server';

/**
 * @fileOverview This file implements the voice search flow for the LocalEyes AI application.
 * It allows users to perform location searches using voice input.
 *
 * @function voiceSearch - The main function that handles the voice search process.
 * @typedef {string} VoiceSearchInput - The input type for the voiceSearch function, which is a string representing the voice query.
 * @typedef {string} VoiceSearchOutput - The output type for the voiceSearch function, which is a string containing the search results.
 */

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VoiceSearchInputSchema = z.string().describe('The voice query string.');
export type VoiceSearchInput = z.infer<typeof VoiceSearchInputSchema>;

const VoiceSearchOutputSchema = z.string().describe('The search results as a string.');
export type VoiceSearchOutput = z.infer<typeof VoiceSearchOutputSchema>;

export async function voiceSearch(input: VoiceSearchInput): Promise<VoiceSearchOutput> {
  return voiceSearchFlow(input);
}

const voiceSearchPrompt = ai.definePrompt({
  name: 'voiceSearchPrompt',
  input: {schema: VoiceSearchInputSchema},
  output: {schema: VoiceSearchOutputSchema},
  prompt: `You are a helpful AI assistant designed to find locations based on user voice input.

  The user will provide a voice query, and you should return a string containing the search results.

  Voice Query: {{{$input}}} `,
});

const voiceSearchFlow = ai.defineFlow(
  {
    name: 'voiceSearchFlow',
    inputSchema: VoiceSearchInputSchema,
    outputSchema: VoiceSearchOutputSchema,
  },
  async input => {
    const {output} = await voiceSearchPrompt(input);
    return output!;
  }
);
