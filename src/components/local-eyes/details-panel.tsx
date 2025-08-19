"use client";

import type { LocationSearchResult } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { MapPin, Globe } from "lucide-react";
import { LocationIcon } from "./location-icon";

interface DetailsPanelProps {
  location: LocationSearchResult | null;
  description: string | null;
  isLoading: boolean;
}

export function DetailsPanel({ location, description, isLoading }: DetailsPanelProps) {
  if (!location) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
        <MapPin className="h-16 w-16 mb-4" />
        <h2 className="text-xl font-semibold">Select a location</h2>
        <p>Choose a location from the list to see its details.</p>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      <Card className="overflow-hidden">
        <div className="relative h-48 w-full">
            <Image
                src={location.imageUrl}
                alt={`Image of ${location.name}`}
                layout="fill"
                objectFit="cover"
                className="transition-transform duration-300 hover:scale-105"
                data-ai-hint={`${location.category} building`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 p-4">
                <div className="p-3 bg-primary/80 backdrop-blur-sm rounded-full inline-block mb-2">
                    <LocationIcon category={location.category} className="h-6 w-6 text-primary-foreground" />
                </div>
                <h2 className="text-2xl font-bold text-white shadow-lg font-headline">{location.name}</h2>
                <p className="text-sm text-white/90 shadow-sm capitalize">{location.category}</p>
            </div>
        </div>
        <CardContent className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <MapPin className="h-5 w-5 mt-1 text-muted-foreground" />
            <div>
              <h3 className="font-semibold">Address</h3>
              <p className="text-muted-foreground">{location.address}</p>
            </div>
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
            <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/90 whitespace-pre-wrap font-body">
              {description}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
