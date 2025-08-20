
"use client";

import * as React from "react";
import { searchLocations } from "@/ai/flows/location-search";
import { generateDetailedDescription } from "@/ai/flows/detailed-description";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button";
import { List, MapIcon } from "lucide-react";

export default function SearchPage() {
  const { toast } = useToast();

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
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        () => {
          toast({
            variant: "destructive",
            title: "Location access denied",
            description: "Please enable location access for better results.",
          });
        }
      );
    }
  }, [toast]);
  
  const updateSearchHistory = (query: string) => {
    const newHistory = [query, ...searchHistory.filter(item => item !== query)].slice(0, 5);
    setSearchHistory(newHistory);
    localStorage.setItem("searchHistory", JSON.stringify(newHistory));
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    setSearchResults(null);
    setSelectedLocation(null);
    setDetailedDescription(null);
    setIsResultsSheetOpen(true);
    
    updateSearchHistory(query);
    
    let finalQuery = query;
    if (useRatingFilter) {
      finalQuery += " with a rating of 4 stars or higher";
    }

    try {
      const result = await searchLocations({
        query: finalQuery,
        userLocation: userLocation ? `${userLocation.latitude},${userLocation.longitude}` : undefined,
        language: navigator.language,
      });

      setSearchResults(result.locations ?? []);
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
  
    const generateMapUrl = () => {
    if (!userLocation) return "";

    const { latitude, longitude } = userLocation;
    let markers = `${latitude},${longitude}`;
    let minLat = latitude, maxLat = latitude, minLon = longitude, maxLon = longitude;

    if (searchResults && searchResults.length > 0) {
      searchResults.forEach(loc => {
        if (loc.lat && loc.lng) {
          markers += `|${loc.lat},${loc.lng}`;
          minLat = Math.min(minLat, loc.lat);
          maxLat = Math.max(maxLat, loc.lat);
          minLon = Math.min(minLon, loc.lng);
          maxLon = Math.max(maxLon, loc.lng);
        }
      });
    }

    const hasSearchResults = searchResults && searchResults.length > 0;

    // Add a small buffer to the bounding box
    const latBuffer = hasSearchResults ? (maxLat - minLat) * 0.1 : 0.05;
    const lonBuffer = hasSearchResults ? (maxLon - minLon) * 0.1 : 0.05;

    const bbox = `${minLon - lonBuffer},${minLat - latBuffer},${maxLon + lonBuffer},${maxLat + latBuffer}`;
    
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${markers}`;
  };


  if (!isClient) {
    return null;
  }

  return (
    <main className="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden">
        <div className="absolute top-0 left-0 right-0 z-10 p-4">
            <SearchPanel
              onSearch={handleSearch}
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
                  <SheetContent side="bottom">
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
          <DialogContent className="sm:max-w-[625px]">
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
