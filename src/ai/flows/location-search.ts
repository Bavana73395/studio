
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
import {searchFoursquare} from '@/services/foursquare';

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
  lat: z.number().optional().describe('The latitude of the location.'),
  lng: z.number().optional().describe('The longitude of the location.'),
  rating: z.number().optional().describe('The rating of the location, from 0 to 10.'),
  hours: z.string().optional().describe('The hours of operation for the location (e.g., "Open", "Closed", "Open 24 hours").'),
  website: z.string().optional().nullable().describe('The website of the location.'),
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

const foursquareTool = ai.defineTool(
  {
    name: 'searchFoursquare',
    description: 'Search for locations using the Foursquare API.',
    inputSchema: z.object({
      query: z.string(),
      ll: z.string().optional(),
      radius: z.number().optional().describe('Radius in meters to search within. This is a hard requirement.'),
      fields: z.string().optional().describe('Fields to include in the response, comma-separated (e.g., "fsq_id,name,rating,hours,website").')
    }),
    outputSchema: z.any(),
  },
  async (input) => {
    return await searchFoursquare(input);
  }
);


const prompt = ai.definePrompt({
  name: 'searchLocationsPrompt',
  input: {schema: SearchLocationsInputSchema},
  output: {schema: SearchLocationsOutputSchema},
  tools: [foursquareTool],
  prompt: `You are a helpful assistant that provides a list of nearby, high-quality locations based on the user's query. Your goal is to find the best and most convenient options for the user.

  Use the searchFoursquare tool to find locations. You MUST request the fsq_id, name, categories, location, geocodes, rating, hours, and website fields.

  User Query: {{{query}}}
  User Location: {{{userLocation}}}
  Language: {{{language}}}

  Provide a list of locations that match the user's query. The locations should be as specific as possible.
  When interpreting the query, assume the user is looking for the best quality options available (e.g., top-rated, popular).
  For each location, provide its name, a category, its full address, its latitude and longitude, a placeholder image URL from placehold.co, its rating, hours, and website if available.
  You MUST prioritize locations that are physically near the user's provided location. When the user's location is available, you MUST use a search radius of 5000 meters. This is a hard requirement. Do not search outside this radius.
  Consider the language of the user query when searching for locations.
  If the user location is not provided, use a general location based on the query.

  Example Output:
  {
    "locations": [
      {
        "name": "The Statue of Liberty",
        "category": "Landmark",
        "address": "New York, NY 10004, USA",
        "imageUrl": "https://placehold.co/600x400.png",
        "lat": 40.6892,
        "lng": -74.0445,
        "rating": 9.0,
        "hours": "Open",
        "website": "https://www.nps.gov/stli/index.htm"
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

