import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import CategoryFilter from "@/components/CategoryFilter";
import EventCard from "@/components/EventCard";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Search } from "lucide-react";
import techEvent from "@/assets/events/tech-event.jpg";
import musicEvent from "@/assets/events/music-event.jpg";
import travelEvent from "@/assets/events/travel-event.jpg";
import partyEvent from "@/assets/events/party-event.jpg";

const Events = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
  }, [selectedCategory, searchQuery]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("events")
        .select(`
          *,
          profiles:organizer_id (username, avatar_url),
          bookings (count)
        `)
        .order("date", { ascending: true });

      if (selectedCategory !== "All") {
        query = query.eq("category", selectedCategory as any);
      }

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      const eventImages = [techEvent, musicEvent, travelEvent, partyEvent];
      const eventsWithImages = (data || []).map((event, idx) => ({
        ...event,
        image_url: event.image_url || eventImages[idx % eventImages.length],
      }));

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

          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="search"
                placeholder="Search events, locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-2"
              />
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
