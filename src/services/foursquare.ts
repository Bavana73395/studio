
/**
 * @fileOverview Foursquare API service for location-based searches.
 */
import fetch from 'node-fetch';

const FOURSQUARE_API_URL = 'https://api.foursquare.com/v3/places/search';

interface FoursquareSearchParams {
  query: string;
  ll?: string;
  limit?: number;
  radius?: number;
  fields?: string;
}

/**
 * Searches the Foursquare API for places matching the given parameters.
 * @param params The search parameters.
 * @returns A promise that resolves to the search results.
 */
export async function searchFoursquare(params: FoursquareSearchParams) {
  const apiKey = process.env.FOURSQUARE_API_KEY;

  if (!apiKey) {
    throw new Error('Foursquare API key is not configured.');
  }

  const searchParams = new URLSearchParams({
    query: params.query,
    limit: (params.limit || 20).toString(),
    ...params.ll && {ll: params.ll},
    ...params.radius && {radius: params.radius.toString()},
    ...params.fields && {fields: params.fields},
  });

  try {
    const response = await fetch(`${FOURSQUARE_API_URL}?${searchParams.toString()}`, {
      headers: {
        Authorization: apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Foursquare API request failed with status ${response.status}`);
    }

    const data = await response.json() as any;
    
    // Transform the data to match LocationSearchResult structure
    const locations = data.results.map((place: any) => ({
        name: place.name,
        category: place.categories[0]?.name || 'uncategorized',
        address: place.location.formatted_address,
        imageUrl: `https://placehold.co/600x400.png`,
        lat: place.geocodes.main.latitude,
        lng: place.geocodes.main.longitude,
        rating: place.rating,
        hours: place.hours?.display,
        website: place.website || undefined
    }));

    return { locations };

  } catch (error) {
    console.error('Foursquare API error:', error);
    throw new Error('Failed to fetch data from Foursquare API.');
  }
}
