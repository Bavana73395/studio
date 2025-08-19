
"use client";

import * as React from "react";
import { searchLocations } from "@/ai/flows/location-search";
import { generateDetailedDescription } from "@/ai/flows/detailed-description";
import { useToast } from "@/hooks/use-toast";
import type { LocationSearchResult } from "@/lib/types";

import { SearchPanel } from "@/components/local-eyes/search-panel";
import { ResultsList } from "@/components/local-eyes/results-list";
import { DetailsPanel } from "@/components/local-eyes/details-panel";
import { Separator } from "@/components/ui/separator";
import { History } from 'lucide-react';

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
          toast({
            title: "Location detected",
            description: "Ready to find places near you.",
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
    } else {
      toast({
        variant: "destructive",
        title: "Geolocation not supported",
        description: "Your browser does not support geolocation.",
      });
    }
  }, [toast]);
  
  const updateSearchHistory = (query: string) => {
    const newHistory = [query, ...searchHistory.filter(item => item !== query)].slice(0, 5);
    setSearchHistory(newHistory);
    localStorage.setItem("searchHistory", JSON.stringify(newHistory));
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      toast({
        variant: "destructive",
        title: "Empty search query",
        description: "Please enter something to search for.",
      });
      return;
    }
    
    setIsSearching(true);
    setSearchResults(null);
    setSelectedLocation(null);
    setDetailedDescription(null);
    
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

      if (result.locations && result.locations.length > 0) {
        setSearchResults(result.locations);
      } else {
        setSearchResults([]);
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
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleSelectLocation = (location: LocationSearchResult) => {
    if (selectedLocation?.name === location.name) {
      setSelectedLocation(null);
      setDetailedDescription(null);
      return;
    }
    setSelectedLocation(location);
    setDetailedDescription(null);
    setIsLoadingDetails(true);

    generateDetailedDescription({
      locationName: location.name,
      locationType: location.category,
      locationAddress: location.address,
    })
      .then(result => {
        setDetailedDescription(result.detailedDescription);
      })
      .catch(error => {
        console.error("Failed to get details:", error);
        toast({
          variant: "destructive",
          title: "Could not load details",
          description: "Failed to get detailed information. Please try again.",
        });
        setDetailedDescription("Sorry, we couldn't load the details for this location.");
      })
      .finally(() => {
        setIsLoadingDetails(false);
      });
  };

  if (!isClient) {
    return null;
  }

  return (
    <main className="flex h-screen bg-background text-foreground overflow-hidden">
      <div className="w-full max-w-sm lg:max-w-md xl:max-w-lg flex flex-col border-r border-border">
        <header className="p-4">
          <h1 className="text-2xl font-bold text-primary font-headline tracking-tight">LocaFind</h1>
          <p className="text-muted-foreground">Your AI-powered local search assistant.</p>
        </header>
        <Separator />
        <SearchPanel
          onSearch={handleSearch}
          isSearching={isSearching}
          useRatingFilter={useRatingFilter}
          setUseRatingFilter={setUseRatingFilter}
        />
        <Separator />
        {searchHistory.length > 0 && (
          <div className="p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                <History className="h-4 w-4" />
                Recent Searches
            </div>
            <div className="flex flex-wrap gap-2">
              {searchHistory.map((query) => (
                <button
                  key={query}
                  onClick={() => handleSearch(query)}
                  className="px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded-full hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  {query}
                </button>
              ))}
            </div>
          </div>
        )}
        <Separator />
        <ResultsList
          results={searchResults}
          isLoading={isSearching}
          onSelectLocation={handleSelectLocation}
          selectedLocation={selectedLocation}
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        <DetailsPanel
          location={selectedLocation}
          description={detailedDescription}
          isLoading={isLoadingDetails}
        />
      </div>
    </main>
  );
}
