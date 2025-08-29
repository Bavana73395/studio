
"use client";

import * as React from "react";
import { useSearchParams, useRouter } from 'next/navigation'
import { searchLocations } from "@/ai/flows/location-search";
import { generateDetailedDescription } from "@/ai/flows/detailed-description";
import { imageToText } from "@/ai/flows/image-to-text";
import { useToast } from "@/hooks/use-toast";
import type { LocationSearchResult } from "@/lib/types";

import { SearchPanel } from "@/components/local-eyes/search-panel";
import { ResultsList } from "@/components/local-eyes/results-list";
import { DetailsPanel } from "@/components/local-eyes/details-panel";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button";
import { List, MapIcon } from "lucide-react";

export default function SearchPage() {
  const { toast } = useToast();
  const searchParams = useSearchParams()
  const router = useRouter();

  const [userLocation, setUserLocation] = React.useState<{ latitude: number; longitude: number } | null>(null);
  const [useRatingFilter, setUseRatingFilter] = React.useState(false);

  const [searchResults, setSearchResults] = React.useState<LocationSearchResult[] | null>(null);
  const [selectedLocation, setSelectedLocation] = React.useState<LocationSearchResult | null>(null);
  const [detailedDescription, setDetailedDescription] = React.useState<string | null>(null);
  
  const [searchHistory, setSearchHistory] = React.useState<string[]>([]);

  const [isSearching, setIsSearching] = React.useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = React.useState(false);
  const [isClient, setIsClient] = React.useState(false);

  const [isResultsSheetOpen, setIsResultsSheetOpen] = React.useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      const history = localStorage.getItem("searchHistory");
      if (history) {
        setSearchHistory(JSON.parse(history));
      }
    }

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setUserLocation(loc);
          
          const initialQuery = searchParams.get('q');
          const nearMe = searchParams.get('near_me');

          if(initialQuery) {
            handleSearch(initialQuery, loc);
          } else if (nearMe) {
            handleSearch("places near me", loc);
          }

        },
        () => {
          toast({
            variant: "destructive",
            title: "Location access denied",
            description: "Please enable location access for better results.",
          });
           router.push('/');
        }
      );
    }
  }, [toast, searchParams, router]);
  
  const updateSearchHistory = (query: string) => {
    const newHistory = [query, ...searchHistory.filter(item => item !== query)].slice(0, 5);
    setSearchHistory(newHistory);
    localStorage.setItem("searchHistory", JSON.stringify(newHistory));
  };

  const handleSearch = async (query: string, location?: {latitude: number, longitude: number} | null) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    setSearchResults(null);
    setSelectedLocation(null);
    setDetailedDescription(null);
    
    updateSearchHistory(query);
    
    let finalQuery = query;
    if (useRatingFilter) {
      finalQuery += " with a rating of 4 stars or higher";
    }
    
    const locationToUse = location || userLocation;

    if (!locationToUse) {
       toast({
        variant: "destructive",
        title: "Location not available",
        description: "Could not determine your location. Please enable location services.",
      });
      setIsSearching(false);
      return;
    }

    // Open the results sheet only if it's not from the initial page load search
    if(!searchParams.get('q') && !searchParams.get('near_me')){
        setIsResultsSheetOpen(true);
    }


    try {
      const result = await searchLocations({
        query: finalQuery,
        userLocation: locationToUse ? `${locationToUse.latitude},${locationToUse.longitude}` : undefined,
        language: navigator.language,
      });

      setSearchResults(result.locations ?? []);
      if(result.locations && result.locations.length > 0) {
        setIsResultsSheetOpen(true);
      } else {
        toast({
            title: "No results found",
            description: "Try a different search query."
        })
      }

    } catch (error: any) {
      console.error("Search failed:", error);
      let description = "Could not fetch locations. Please try again.";
      if (error.message && error.message.includes("503 Service Unavailable")) {
        description = "The AI model is currently overloaded. Please try again in a few moments."
      }
      toast({
        variant: "destructive",
        title: "Search failed",
        description: description,
      });
      setSearchResults([]);
    } finally {
      setIsSearching(false);
      // Clear the query params from URL after initial search
      router.replace('/search', undefined);
    }
  };
  
  const handleSelectLocation = async (location: LocationSearchResult) => {
    setSelectedLocation(location);
    setIsDetailsDialogOpen(true);
    setDetailedDescription(null);
    setIsLoadingDetails(true);

    try {
      const result = await generateDetailedDescription({
        locationName: location.name,
        locationType: location.category,
        locationAddress: location.address,
      });
      setDetailedDescription(result.detailedDescription);
    } catch (error) {
      console.error("Failed to get details:", error);
      toast({
        variant: "destructive",
        title: "Could not load details",
        description: "Failed to get detailed information. Please try again.",
      });
      setDetailedDescription("Sorry, we couldn't load the details for this location.");
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleImageSearch = (file: File) => {
    setIsSearching(true);
    toast({ title: "Analyzing Image...", description: "Extracting text from the image." });
    const reader = new FileReader();
    reader.onload = async (e) => {
      const photoDataUri = e.target?.result as string;
      try {
        const result = await imageToText({ photoDataUri });
        if (result.extractedText) {
          toast({ title: "Text Extracted", description: "Performing search with the extracted text." });
          handleSearch(result.extractedText);
        } else {
          toast({ variant: "destructive", title: "No text found", description: "Could not find any text in the image." });
          setIsSearching(false);
        }
      } catch (error) {
        console.error("Image to text failed:", error);
        toast({ variant: "destructive", title: "Image analysis failed", description: "Could not extract text from the image." });
        setIsSearching(false);
      }
    };
    reader.readAsDataURL(file);
  };
  
  const generateMapUrl = () => {
    if (!userLocation) return "";

    const { latitude, longitude } = userLocation;
    let markers = ``;
    let boundingBoxCoords: number[][] = [[longitude, latitude], [longitude, latitude]];

    const hasSearchResults = searchResults && searchResults.length > 0;

    if (hasSearchResults) {
        markers = searchResults
            .map(loc => loc.lat && loc.lng ? `|${loc.lat},${loc.lng}` : "")
            .join('');

        searchResults.forEach(loc => {
            if (loc.lat && loc.lng) {
                boundingBoxCoords[0][0] = Math.min(boundingBoxCoords[0][0], loc.lng);
                boundingBoxCoords[0][1] = Math.min(boundingBoxCoords[0][1], loc.lat);
                boundingBoxCoords[1][0] = Math.max(boundingBoxCoords[1][0], loc.lng);
                boundingBoxCoords[1][1] = Math.max(boundingBoxCoords[1][1], loc.lat);
            }
        });
    } else {
      markers = `|${latitude},${longitude}`;
    }
    
    // Add user location to bounding box calculation
    boundingBoxCoords[0][0] = Math.min(boundingBoxCoords[0][0], longitude);
    boundingBoxCoords[0][1] = Math.min(boundingBoxCoords[0][1], latitude);
    boundingBoxCoords[1][0] = Math.max(boundingBoxCoords[1][0], longitude);
    boundingBoxCoords[1][1] = Math.max(boundingBoxCoords[1][1], latitude);


    const url = `https://www.openstreetmap.org/export/embed.html?layer=mapnik&marker=${latitude},${longitude}${markers}`;
    
    // If there are search results, calculate a bounding box to fit all markers
    if (hasSearchResults) {
        const [minLon, minLat] = boundingBoxCoords[0];
        const [maxLon, maxLat] = boundingBoxCoords[1];

      // Add a small buffer to the bounding box
      const latBuffer = (maxLat - minLat) * 0.1 || 0.01;
      const lonBuffer = (maxLon - minLon) * 0.1 || 0.01;
      const bbox = `${minLon - lonBuffer},${minLat - latBuffer},${maxLon + lonBuffer},${maxLat + latBuffer}`;
      return `${url}&bbox=${bbox}`;
    }
    
    // If no results, just center on the user's location with a default zoom level
    return url;
  };

  if (!isClient) {
    return null;
  }

  return (
    <main className="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden">
        <div className="absolute top-0 left-0 right-0 z-10 p-4">
            <SearchPanel
              onSearch={handleSearch}
              onImageSearch={handleImageSearch}
              isSearching={isSearching}
              useRatingFilter={useRatingFilter}
              setUseRatingFilter={setUseRatingFilter}
            />
        </div>
        
        <div className="flex-1 h-full w-full bg-muted">
          {userLocation ? (
             <iframe
              title="Current Location Map"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              src={generateMapUrl()}
            ></iframe>
          ) : (
            <div className="h-full w-full flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                    <MapIcon className="mx-auto h-12 w-12" />
                    <p className="mt-2">Getting your location...</p>
                </div>
            </div>
          )}
        </div>
        
        {searchResults && (
            <div className="absolute bottom-4 right-4 z-10">
                <Sheet open={isResultsSheetOpen} onOpenChange={setIsResultsSheetOpen}>
                  <SheetTrigger asChild>
                    <Button size="lg" className="rounded-full shadow-lg">
                        <List className="mr-2" />
                        Show Results
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="dark">
                    <SheetHeader>
                      <SheetTitle>Search Results</SheetTitle>
                       <SheetDescription>
                        Showing {searchResults.length} locations.
                      </SheetDescription>
                    </SheetHeader>
                    <ResultsList
                      results={searchResults}
                      isLoading={isSearching}
                      onSelectLocation={handleSelectLocation}
                      selectedLocation={selectedLocation}
                    />
                  </SheetContent>
                </Sheet>
            </div>
        )}

        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="sm:max-w-[625px] dark">
            <DialogHeader>
              <DialogTitle>
                  {selectedLocation ? selectedLocation.name : "Location Details"}
              </DialogTitle>
              <DialogDescription className="sr-only">
                  Details for {selectedLocation?.name}.
              </DialogDescription>
            </DialogHeader>
              <DetailsPanel
                location={selectedLocation}
                description={detailedDescription}
                isLoading={isLoadingDetails}
              />
          </DialogContent>
        </Dialog>

    </main>
  );
}
