
"use client";

import * as React from "react";
import type { LocationCategory } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Mic, Search, Utensils, Bed, Hospital } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface SearchPanelProps {
  onSearch: (query: string) => void;
  isSearching: boolean;
  category: LocationCategory;
  setCategory: (category: LocationCategory) => void;
  useRatingFilter: boolean;
  setUseRatingFilter: (value: boolean) => void;
}

export function SearchPanel({ onSearch, isSearching, category, setCategory, useRatingFilter, setUseRatingFilter }: SearchPanelProps) {
  const [query, setQuery] = React.useState("");
  const [isListening, setIsListening] = React.useState(false);
  const { toast } = useToast();
  
  const speechRecognitionRef = React.useRef<SpeechRecognition | null>(null);
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  React.useEffect(() => {
    if (!isClient) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      speechRecognitionRef.current = new SpeechRecognition();
      speechRecognitionRef.current.continuous = false;
      speechRecognitionRef.current.lang = 'en-US';
      speechRecognitionRef.current.interimResults = false;
      speechRecognitionRef.current.maxAlternatives = 1;

      speechRecognitionRef.current.onresult = (event) => {
        const speechResult = event.results[0][0].transcript;
        setQuery(speechResult);
        handleSearch(speechResult, category);
      };

      speechRecognitionRef.current.onerror = (event) => {
        toast({ variant: "destructive", title: "Voice search error", description: event.error });
      };
      
      speechRecognitionRef.current.onstart = () => setIsListening(true);
      speechRecognitionRef.current.onend = () => setIsListening(false);
    }
  }, [toast, isClient]);

  const handleCategoryClick = (newCategory: LocationCategory) => {
    setCategory(newCategory);
    handleSearch(newCategory, newCategory);
  };
  
  const handleSearch = (currentQuery: string, currentCategory: LocationCategory) => {
    if (currentQuery.trim() !== "") {
      onSearch(`${currentQuery} near me in ${currentCategory}`);
    } else {
      onSearch(currentCategory);
    }
  };

  const startVoiceSearch = () => {
    if (speechRecognitionRef.current && !isListening) {
      speechRecognitionRef.current.start();
    } else {
       toast({ variant: "destructive", title: "Voice search not available", description: "Your browser does not support voice search." });
    }
  };

  if (!isClient) {
    return null;
  }
  
  return (
    <div className="p-4 space-y-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch(query, category);
        }}
      >
        <div className="relative">
          <Input
            placeholder={`Search for a ${category}...`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pr-20"
            disabled={isSearching}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-2">
            <Button type="button" variant="ghost" size="icon" onClick={startVoiceSearch} disabled={isSearching || isListening}>
              <Mic className={cn("h-5 w-5", isListening && "text-destructive animate-pulse")} />
            </Button>
            <Button type="submit" variant="ghost" size="icon" disabled={isSearching}>
              <Search className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </form>
      
      <div className="space-y-2">
        <Label>Categories</Label>
        <div className="grid grid-cols-3 gap-2">
          <Button variant={category === 'restaurant' ? 'default' : 'outline'} onClick={() => handleCategoryClick('restaurant')} disabled={isSearching}>
            <Utensils className="mr-2 h-4 w-4" /> Restaurants
          </Button>
          <Button variant={category === 'hotel' ? 'default' : 'outline'} onClick={() => handleCategoryClick('hotel')} disabled={isSearching}>
            <Bed className="mr-2 h-4 w-4" /> Hotels
          </Button>
          <Button variant={category === 'hospital' ? 'default' : 'outline'} onClick={() => handleCategoryClick('hospital')} disabled={isSearching}>
            <Hospital className="mr-2 h-4 w-4" /> Hospitals
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
        <div className="space-y-0.5">
            <Label>Top Rated</Label>
            <p className="text-sm text-muted-foreground">Filter for places with 4.5+ stars.</p>
        </div>
        <Switch checked={useRatingFilter} onCheckedChange={setUseRatingFilter} disabled={isSearching} />
      </div>
    </div>
  );
}
