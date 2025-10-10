import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import CategoryFilter from "@/components/CategoryFilter";
import EventCard from "@/components/EventCard";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import techEvent from "@/assets/events/tech-event.jpg";
import musicEvent from "@/assets/events/music-event.jpg";
import travelEvent from "@/assets/events/travel-event.jpg";
import partyEvent from "@/assets/events/party-event.jpg";

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, [selectedCategory]);

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

      const { data, error } = await query;

      if (error) throw error;

      // Add sample images to events
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
      <Hero />

      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Discover Events
            </h2>
            <p className="text-muted-foreground text-lg">
              Find amazing events happening near you
            </p>
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
                No events found in this category. Be the first to create one!
              </p>
            </div>
          ) : (
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
          )}
        </div>
      </section>
    </div>
  );
};

export default Index;
