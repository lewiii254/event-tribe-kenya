import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import EventCard from "./EventCard";
import { Sparkles, Loader2 } from "lucide-react";

interface EventRecommendationsProps {
  userId: string | undefined;
  currentEventId?: string;
  limit?: number;
}

const EventRecommendations = ({
  userId,
  currentEventId,
  limit = 4,
}: EventRecommendationsProps) => {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, [userId, currentEventId]);

  const fetchRecommendations = async () => {
    setLoading(true);

    try {
      if (!userId) {
        // For non-authenticated users, show popular events
        await fetchPopularEvents();
        return;
      }

      // Get user's interests and booking history
      const { data: profile } = await supabase
        .from("profiles")
        .select("interests")
        .eq("id", userId)
        .single();

      const { data: bookings } = await supabase
        .from("bookings")
        .select("event_id")
        .eq("user_id", userId);

      const { data: favorites } = await supabase
        .from("event_favorites")
        .select("event_id")
        .eq("user_id", userId);

      // Get categories from booked/favorited events
      const bookedEventIds = bookings?.map((b) => b.event_id) || [];
      const favoritedEventIds = favorites?.map((f) => f.event_id) || [];
      const allEventIds = [...bookedEventIds, ...favoritedEventIds];

      let userCategories: string[] = [];
      
      if (allEventIds.length > 0) {
        const { data: events } = await supabase
          .from("events")
          .select("category")
          .in("id", allEventIds);

        userCategories = events?.map((e) => e.category) || [];
      }

      // Combine user interests with categories from their history
      const allInterests = [
        ...(profile?.interests || []),
        ...userCategories,
      ];

      // Build recommendations query
      let query = supabase
        .from("events")
        .select(
          `
          *,
          profiles:organizer_id (username, avatar_url),
          bookings (count)
        `
        )
        .gte("date", new Date().toISOString())
        .order("date", { ascending: true });

      if (currentEventId) {
        query = query.neq("id", currentEventId);
      }

      // Filter by user interests if available
      if (allInterests.length > 0) {
        query = query.in("category", allInterests);
      }

      const { data: recommendedEvents, error } = await query.limit(limit);

      if (error) throw error;

      // If no recommendations based on interests, fall back to popular events
      if (!recommendedEvents || recommendedEvents.length === 0) {
        await fetchPopularEvents();
      } else {
        setRecommendations(recommendedEvents);
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      await fetchPopularEvents();
    } finally {
      setLoading(false);
    }
  };

  const fetchPopularEvents = async () => {
    try {
      let query = supabase
        .from("events")
        .select(
          `
          *,
          profiles:organizer_id (username, avatar_url),
          bookings (count)
        `
        )
        .gte("date", new Date().toISOString())
        .order("date", { ascending: true });

      if (currentEventId) {
        query = query.neq("id", currentEventId);
      }

      const { data, error } = await query.limit(limit);

      if (error) throw error;

      // Sort by booking count to show popular events first
      const sortedData =
        data?.sort((a, b) => {
          const countA = a.bookings?.[0]?.count || 0;
          const countB = b.bookings?.[0]?.count || 0;
          return countB - countA;
        }) || [];

      setRecommendations(sortedData);
    } catch (error) {
      console.error("Error fetching popular events:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          {userId ? "Recommended for You" : "Popular Events"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {recommendations.map((event) => (
            <EventCard
              key={event.id}
              id={event.id}
              title={event.title}
              date={event.date}
              location={event.location}
              category={event.category}
              imageUrl={event.image_url}
              price={event.price}
              isFree={event.is_free}
              attendeeCount={event.bookings?.[0]?.count || 0}
              maxAttendees={event.max_attendees}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default EventRecommendations;
