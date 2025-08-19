'use server';
/**
 * @fileOverview A location search AI agent.
 *
 * - searchLocations - A function that handles the location search process.
 * - SearchLocationsInput - The input type for the searchLocations function.
 * - SearchLocationsOutput - The return type for the searchLocations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SearchLocationsInputSchema = z.object({
  query: z.string().describe('The user query for searching locations.'),
  userLocation: z
    .string()
    .optional()
    .describe("The user's current location (e.g., 'latitude,longitude')."),
  language: z.string().optional().describe('The language of the user query.'),
});
export type SearchLocationsInput = z.infer<typeof SearchLocationsInputSchema>;

const SearchLocationsOutputSchema = z.object({
  locations: z
    .array(z.string())
    .describe('A list of nearby locations matching the query.'),
});
export type SearchLocationsOutput = z.infer<typeof SearchLocationsOutputSchema>;

export async function searchLocations(input: SearchLocationsInput): Promise<SearchLocationsOutput> {
  return searchLocationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'searchLocationsPrompt',
  input: {schema: SearchLocationsInputSchema},
  output: {schema: SearchLocationsOutputSchema},
  prompt: `You are a helpful assistant that provides a list of nearby locations based on the user's query.

  User Query: {{{query}}}
  User Location: {{{userLocation}}}
  Language: {{{language}}}

  Provide a list of locations that match the user's query. The locations should be as specific as possible.
  Ensure that the locations are near the user's current location.
  Consider the language of the user query when searching for locations.
  If the user location is not provided, use a general location based on the query.

  Example Output:
  {
    "locations": ["Location 1", "Location 2", "Location 3"]
  }`,
});

const searchLocationsFlow = ai.defineFlow(
  {
    name: 'searchLocationsFlow',
    inputSchema: SearchLocationsInputSchema,
    outputSchema: SearchLocationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
