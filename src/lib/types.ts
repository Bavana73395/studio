export type LocationCategory = string;

export interface LocationSearchResult {
  name: string;
  category: LocationCategory;
  address: string;
  imageUrl: string;
  lat?: number;
  lng?: number;
}
