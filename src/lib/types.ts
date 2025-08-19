export type LocationCategory = 'restaurant' | 'hotel' | 'hospital';

export interface LocationSearchResult {
  name: string;
  category: LocationCategory;
}
