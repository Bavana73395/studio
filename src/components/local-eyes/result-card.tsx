"use client";

import type { LocationSearchResult } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LocationIcon } from "./location-icon";

interface ResultCardProps {
  location: LocationSearchResult;
  onSelect: () => void;
  isSelected: boolean;
}

export function ResultCard({ location, onSelect, isSelected }: ResultCardProps) {
  return (
    <Card
      onClick={onSelect}
      className={cn(
        "p-3 flex items-center space-x-4 cursor-pointer transition-all duration-200",
        "hover:shadow-md hover:border-primary",
        isSelected ? "bg-primary/10 border-primary" : "bg-card"
      )}
    >
      <div className={cn("p-2 rounded-lg", isSelected ? 'bg-primary text-primary-foreground': 'bg-secondary text-secondary-foreground')}>
        <LocationIcon category={location.category} className="h-6 w-6" />
      </div>
      <div className="flex-1 overflow-hidden">
        <h3 className="font-semibold text-sm truncate">{location.name}</h3>
        <p className="text-xs text-muted-foreground capitalize truncate">{location.address}</p>
      </div>
    </Card>
  );
}
