
"use client";

import type { LocationSearchResult } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { ResultCard } from "./result-card";
import { Frown } from "lucide-react";

interface ResultsListProps {
  results: LocationSearchResult[] | null;
  isLoading: boolean;
  onSelectLocation: (location: LocationSearchResult) => void;
  selectedLocation: LocationSearchResult | null;
}

export function ResultsList({ results, isLoading, onSelectLocation, selectedLocation }: ResultsListProps) {
  return (
    <ScrollArea className="h-[40vh]">
      <div className="p-4 space-y-2">
        {isLoading &&
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4 p-2">
              <Skeleton className="h-12 w-12 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ))}

        {!isLoading && results && results.length > 0 &&
          results.map((location) => (
            <ResultCard
              key={location.name}
              location={location}
              onSelect={() => onSelectLocation(location)}
              isSelected={selectedLocation?.name === location.name}
            />
          ))}

        {!isLoading && results && results.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">
             <Frown className="mx-auto h-12 w-12" />
            <h3 className="mt-2 text-sm font-medium">No results found</h3>
            <p className="mt-1 text-sm">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
