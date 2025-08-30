
"use client";
import React from 'react';
import type { LocationSearchResult } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LocationIcon } from "./location-icon";
import Image from 'next/image';
import { Star } from "lucide-react";

interface ResultCardProps {
  location: LocationSearchResult;
  onSelect: () => void;
  isSelected: boolean;
}

export const ResultCard = React.memo(function ResultCard({ location, onSelect, isSelected }: ResultCardProps) {
  return (
    <Card
      onClick={onSelect}
      className={cn(
        "p-3 flex items-start space-x-4 cursor-pointer transition-all duration-200 border-2",
        "hover:shadow-md hover:border-primary",
        isSelected ? "bg-primary/10 border-primary" : "bg-card border-transparent"
      )}
    >
      <div className="relative h-16 w-16 rounded-lg overflow-hidden shrink-0">
        <Image src={location.imageUrl} alt={location.name} fill objectFit="cover" data-ai-hint={`${location.category} building`} />
      </div>
      <div className="flex-1 overflow-hidden">
        <h3 className="font-semibold text-base truncate flex items-center gap-2">
            <LocationIcon category={location.category} className="h-4 w-4 text-primary shrink-0" />
            {location.name}
        </h3>
        <p className="text-sm text-muted-foreground capitalize truncate">{location.address}</p>
        <div className="flex items-center gap-4 mt-1 text-xs">
            {location.rating && (
                <div className="flex items-center gap-1 text-muted-foreground">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span className="font-medium">{(location.rating / 2).toFixed(1)}</span>
                </div>
            )}
             {location.hours && (
                <span className={cn("font-semibold", location.hours.toLowerCase() === 'open' ? 'text-green-600' : 'text-red-600')}>
                    {location.hours}
                </span>
            )}
        </div>
      </div>
    </Card>
  );
});
