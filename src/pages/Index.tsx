import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import CategoryFilter from "@/components/CategoryFilter";
import EventCard from "@/components/EventCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "lucide-react";
import techEvent from "@/assets/events/tech-event.jpg";
import musicEvent from "@/assets/events/music-event.jpg";
import travelEvent from "@/assets/events/travel-event.jpg";
import partyEvent from "@/assets/events/party-event.jpg";
import { Event } from "@/types";
import { Database } from "@/integrations/supabase/types";

type EventCategory = Database["public"]["Enums"]["event_category"];

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("events")
        .select(`
          id,
          title,
          category,
          location,
          date,
          price,
          is_free,
          image_url,
          organizer_id,
          profiles:organizer_id (username, avatar_url)
        `, { count: 'exact' })
        .gte('date', new Date().toISOString())
        .order("date", { ascending: true })
        .limit(12);

      if (selectedCategory !== "All") {
        query = query.eq("category", selectedCategory as EventCategory);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Add sample images to events
      const eventImages = [techEvent, musicEvent, travelEvent, partyEvent];
      const eventsWithImages = (data || []).map((event, idx) => ({
        ...event,
        image_url: event.image_url || eventImages[idx % eventImages.length],
        bookings: [{ count: 0 }]
      })) as Event[];

      setEvents(eventsWithImages);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchEvents();

    // Subscribe to realtime events
    const channel = supabase
      .channel('events-index')
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
  }, [fetchEvents]);

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
            <LoadingSpinner size="lg" text="Discovering awesome events..." className="py-20" />
          ) : events.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No events found in this category"
              description="Be the first to create an amazing event in this category and start building your community!"
              actionLabel="Create Event"
              actionLink="/create"
            />
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
