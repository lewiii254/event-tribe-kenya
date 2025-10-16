import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import CategoryFilter from "@/components/CategoryFilter";
import EventCard from "@/components/EventCard";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import techEvent from "@/assets/events/tech-event.jpg";
import musicEvent from "@/assets/events/music-event.jpg";
import travelEvent from "@/assets/events/travel-event.jpg";
import partyEvent from "@/assets/events/party-event.jpg";

const Events = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("date");
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [showFreeOnly, setShowFreeOnly] = useState(false);

  useEffect(() => {
    fetchEvents();

    // Subscribe to realtime events
    const channel = supabase
      .channel('events-all')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events'
        },
        () => {
          fetchEvents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedCategory, searchQuery, sortBy, priceRange, showFreeOnly]);

  const fetchEvents = async () => {
    try {
      let query = supabase
        .from("events")
        .select(`
          *,
          profiles:organizer_id (username, avatar_url),
          bookings (count)
        `);

      if (selectedCategory !== "All") {
        query = query.eq("category", selectedCategory as any);
      }

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%`);
      }

      if (showFreeOnly) {
        query = query.eq("is_free", true);
      } else {
        query = query.gte("price", priceRange[0]).lte("price", priceRange[1]);
      }

      // Apply sorting
      switch (sortBy) {
        case "date":
          query = query.order("date", { ascending: true });
          break;
        case "price-low":
          query = query.order("price", { ascending: true });
          break;
        case "price-high":
          query = query.order("price", { ascending: false });
          break;
        case "popularity":
          // This will be handled client-side since we need bookings count
          query = query.order("created_at", { ascending: false });
          break;
        default:
          query = query.order("date", { ascending: true });
      }

      const { data, error } = await query;

      if (error) throw error;

      const eventImages = [techEvent, musicEvent, travelEvent, partyEvent];
      let eventsWithImages = (data || []).map((event, idx) => ({
        ...event,
        image_url: event.image_url || eventImages[idx % eventImages.length],
      }));

      // Client-side sorting for popularity
      if (sortBy === "popularity") {
        eventsWithImages = eventsWithImages.sort((a, b) => {
          const countA = a.bookings?.[0]?.count || 0;
          const countB = b.bookings?.[0]?.count || 0;
          return countB - countA;
        });
      }

      setEvents(eventsWithImages);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Browse All Events
            </h1>
            <p className="text-muted-foreground text-lg">
              Discover amazing experiences in your area
            </p>
          </div>

          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="search"
                placeholder="Search events, locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-2"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="popularity">Popularity</SelectItem>
                </SelectContent>
              </Select>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <SlidersHorizontal className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Filter Events</SheetTitle>
                    <SheetDescription>
                      Customize your event search with filters
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6 space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Price Range (KSh)</Label>
                        <span className="text-sm text-muted-foreground">
                          {priceRange[0]} - {priceRange[1]}
                        </span>
                      </div>
                      <Slider
                        min={0}
                        max={10000}
                        step={100}
                        value={priceRange}
                        onValueChange={setPriceRange}
                        disabled={showFreeOnly}
                        className="w-full"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="free-only"
                        checked={showFreeOnly}
                        onChange={(e) => setShowFreeOnly(e.target.checked)}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="free-only" className="cursor-pointer">
                        Show free events only
                      </Label>
                    </div>

                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        setSortBy("date");
                        setPriceRange([0, 10000]);
                        setShowFreeOnly(false);
                        setSelectedCategory("All");
                        setSearchQuery("");
                      }}
                    >
                      Reset Filters
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          <div className="mb-8">
            <CategoryFilter
              selected={selectedCategory}
              onSelect={setSelectedCategory}
            />
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-muted-foreground">
                {searchQuery ? "No events match your search. Try different keywords!" : "No events found. Be the first to create one!"}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-sm text-muted-foreground mb-4">
                {events.length} event{events.length !== 1 ? 's' : ''} found
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
                {events.map((event) => (
                  <EventCard
                    key={event.id}
                    id={event.id}
                    title={event.title}
                    category={event.category}
                    image={event.image_url}
                    location={event.location}
                    date={event.date}
                    price={event.price}
                    isFree={event.is_free}
                    attendeeCount={event.bookings?.[0]?.count || 0}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Events;
