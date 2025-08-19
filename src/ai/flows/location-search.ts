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
import type {LocationSearchResult} from '@/lib/types';

const SearchLocationsInputSchema = z.object({
  query: z.string().describe('The user query for searching locations.'),
  userLocation: z
    .string()
    .optional()
    .describe("The user's current location (e.g., 'latitude,longitude')."),
  language: z.string().optional().describe('The language of the user query.'),
});
export type SearchLocationsInput = z.infer<typeof SearchLocationsInputSchema>;

const LocationSearchResultSchema = z.object({
  name: z.string().describe('The name of the location.'),
  category: z.string().describe('A category for the location (e.g., restaurant, park, museum).'),
  address: z.string().describe('The full address of the location.'),
  imageUrl: z.string().url().describe('A URL to an image of the location.'),
});

const SearchLocationsOutputSchema = z.object({
  locations: z
    .array(LocationSearchResultSchema)
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
  For each location, provide its name, a category, its full address, and a placeholder image URL from placehold.co.
  You MUST prioritize locations that are physically near the user's provided location.
  Consider the language of the user query when searching for locations.
  If the user location is not provided, use a general location based on the query.

  Example Output:
  {
    "locations": [
      {
        "name": "The Statue of Liberty",
        "category": "Landmark",
        "address": "New York, NY 10004, USA",
        "imageUrl": "https://placehold.co/600x400.png"
      }
    ]
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
