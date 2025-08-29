
"use client";

import type { LocationSearchResult } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { MapPin, Navigation, Globe, Star, Clock } from "lucide-react";
import { LocationIcon } from "./location-icon";
import { Button } from "@/components/ui/button";

interface DetailsPanelProps {
  location: LocationSearchResult | null;
  description: string | null;
  isLoading: boolean;
}

export function DetailsPanel({ location, description, isLoading }: DetailsPanelProps) {
  if (isLoading || !location) {
    return (
      <div className="p-4 lg:p-6">
        <div className="space-y-4">
          <Skeleton className="h-48 w-full rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
        </div>
      </div>
    );
  }

  const handleViewOnMap = () => {
    if (location) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(location.address)}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="p-1">
        <div className="relative h-48 w-full">
            <Image
                src={location.imageUrl}
                alt={`Image of ${location.name}`}
                fill
                objectFit="cover"
                className="rounded-lg transition-transform duration-300 hover:scale-105"
                data-ai-hint={`${location.category} building`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg" />
            <div className="absolute bottom-0 left-0 p-4">
                <div className="p-3 bg-primary/80 backdrop-blur-sm rounded-full inline-block mb-2">
                    <LocationIcon category={location.category} className="h-6 w-6 text-primary-foreground" />
                </div>
                <h2 className="text-2xl font-bold text-white shadow-lg font-headline">{location.name}</h2>
                <p className="text-sm text-white/90 shadow-sm capitalize">{location.category}</p>
            </div>
             {location.rating && (
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-background/80 backdrop-blur-sm text-foreground py-1 px-2 rounded-full text-sm font-medium">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span>{(location.rating / 2).toFixed(1)}</span>
                </div>
            )}
        </div>
        <div className="p-4 space-y-4">
             <div className="grid grid-cols-2 gap-4 text-sm">
                {location.hours && (
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className={location.hours.toLowerCase() === 'open' ? 'text-green-600' : 'text-red-600'}>{location.hours}</span>
                    </div>
                )}
                 {location.website && (
                    <div className="flex items-center gap-2 truncate">
                       <Globe className="w-4 h-4 text-muted-foreground" />
                       <a href={location.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">
                           {location.website.replace(/^(https?:\/\/)?(www\.)?/, '')}
                        </a>
                    </div>
                )}
            </div>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <MapPin className="h-5 w-5 mt-1 text-muted-foreground shrink-0" />
              <div>
                <h3 className="font-semibold">Address</h3>
                <p className="text-muted-foreground">{location.address}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleViewOnMap} className="shrink-0">
              <Navigation className="mr-2 h-4 w-4" />
              View on Map
            </Button>
          </div>
          <h3 className="font-semibold text-lg mb-2">AI-Generated Details</h3>
          {isLoading && (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          )}
          {!isLoading && description && (
            <div className="prose prose-sm max-w-none text-foreground/90 whitespace-pre-wrap font-body">
              {description}
            </div>
          )}
        </div>
    </div>
  );
}
