
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LocateIcon, Search, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LandingPage() {
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const [query, setQuery] = useState('');

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };
  
  const handleNearMe = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => {
          router.push('/search?near_me=true');
        },
        () => {
          toast({
            variant: "destructive",
            title: "Location access denied",
            description: "Please enable location access to use the 'Near Me' feature.",
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
  }

  if (!isClient) {
    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen bg-transparent text-foreground p-4 overflow-hidden">
            <main className="relative z-10 flex flex-col items-center justify-center text-center w-full max-w-2xl">
                <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mb-4 border-4 border-primary/20">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/50 opacity-75"></span>
                    <LocateIcon className="relative inline-flex h-12 w-12 text-primary" />
                </div>
                <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                    LocaFind
                </h1>
                <p className="max-w-md mx-auto text-lg text-muted-foreground mt-4">
                  Loading your next adventure...
                </p>
            </main>
        </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-transparent text-foreground p-4 overflow-hidden">
      <main className="relative z-10 flex flex-col items-center justify-center text-center w-full max-w-2xl">
        <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mb-4 border-4 border-primary/20">
              <LocateIcon className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            LocaFind
            </h1>
        </div>
        <p className="max-w-md mx-auto text-lg text-muted-foreground mb-8">
          Discover the best local spots, from hidden gems to popular hangouts. Your next adventure is just a search away.
        </p>

        <form onSubmit={handleSearch} className="w-full max-w-md">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                    type="text"
                    placeholder="Search for 'hotels', 'parks', etc."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full h-14 pl-10 pr-4 py-2 text-lg bg-secondary/50 border-2 border-border rounded-full focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
            </div>
            <div className="flex items-center justify-center gap-4 mt-4">
                <Button type="submit" size="lg" className="rounded-full w-full">
                    <Search className="mr-2 h-5 w-5" />
                    Search
                </Button>
                <Button type="button" variant="outline" size="lg" className="rounded-full w-full" onClick={handleNearMe}>
                    <MapPin className="mr-2 h-5 w-5" />
                    Near Me
                </Button>
            </div>
        </form>
      </main>

      <footer className="absolute bottom-6 z-10 text-xs text-muted-foreground">
        &copy; 2024 LocaFind. All rights reserved.
      </footer>
    </div>
  );
}
