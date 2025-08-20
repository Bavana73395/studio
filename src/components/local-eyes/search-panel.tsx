
"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Mic, Search, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface SearchPanelProps {
  onSearch: (query: string) => void;
  isSearching: boolean;
  useRatingFilter: boolean;
  setUseRatingFilter: (value: boolean) => void;
}

export function SearchPanel({ onSearch, isSearching, useRatingFilter, setUseRatingFilter }: SearchPanelProps) {
  const [query, setQuery] = React.useState("");
  const [isListening, setIsListening] = React.useState(false);
  const { toast } = useToast();
  
  const speechRecognitionRef = React.useRef<SpeechRecognition | null>(null);

  React.useEffect(() => {
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
        handleSearch(speechResult);
      };

      speechRecognitionRef.current.onerror = (event) => {
        toast({ variant: "destructive", title: "Voice search error", description: event.error });
      };
      
      speechRecognitionRef.current.onstart = () => setIsListening(true);
      speechRecognitionRef.current.onend = () => setIsListening(false);
    }
  }, [toast, onSearch]);
  
  const handleSearch = (searchQuery: string) => {
    onSearch(searchQuery);
  };

  const startVoiceSearch = () => {
    if (speechRecognitionRef.current && !isListening) {
      speechRecognitionRef.current.start();
    } else {
       toast({ variant: "destructive", title: "Voice search not available", description: "Your browser does not support voice search." });
    }
  };

  const quickSearch = (term: string) => {
    setQuery(term);
    handleSearch(term);
  }
  
  return (
      <Card className="p-2 shadow-xl rounded-2xl">
        <form
            onSubmit={(e) => {
            e.preventDefault();
            handleSearch(query);
            }}
        >
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder="Search for places..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-10 pr-10 h-12 text-lg rounded-xl border-0 shadow-none focus-visible:ring-0"
                    disabled={isSearching}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                    <Button type="button" variant="ghost" size="icon" className="rounded-full" onClick={startVoiceSearch} disabled={isSearching || isListening}>
                        <Mic className={cn("h-5 w-5", isListening && "text-destructive animate-pulse")} />
                    </Button>
                </div>
            </div>
        </form>
        <div className="flex items-center justify-start gap-2 p-2">
            <Button variant="outline" size="sm" onClick={() => quickSearch('restaurants')}>Restaurants</Button>
            <Button variant="outline" size="sm" onClick={() => quickSearch('cafes')}>Cafes</Button>
            <Button variant="outline" size="sm" onClick={() => quickSearch('parks')}>Parks</Button>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                        <Star className="mr-2 h-4 w-4" />
                        Rated
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto">
                    <div className="flex items-center justify-between rounded-lg p-3">
                        <div className="space-y-0.5 mr-4">
                            <Label>Top Rated</Label>
                            <p className="text-sm text-muted-foreground">Filter for places with 4+ stars.</p>
                        </div>
                        <Switch checked={useRatingFilter} onCheckedChange={setUseRatingFilter} disabled={isSearching} />
                    </div>
                </PopoverContent>
            </Popover>
        </div>
      </Card>
  );
}
