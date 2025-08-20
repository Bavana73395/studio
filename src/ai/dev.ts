import { config } from 'dotenv';
config();

import '@/ai/flows/location-search.ts';
import '@/ai/flows/rating-filter.ts';
import '@/ai/flows/voice-search.ts';
import '@/ai/flows/multilingual-support.ts';
import '@/ai/flows/detailed-description.ts';
import '@/ai/flows/image-to-text.ts';
import '@/services/foursquare.ts';
