import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface SimilarEventsProps {
  currentEventId: string;
  category: string;
}

const SimilarEvents = ({ currentEventId, category }: SimilarEventsProps) => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSimilarEvents();
  }, [currentEventId, category]);

  const fetchSimilarEvents = async () => {
    try {
      const { data, error } = await supabase
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
          event_ratings (rating)
        `)
        .eq("category", category as any)
        .neq("id", currentEventId)
        .gte("date", new Date().toISOString())
        .limit(3);

      if (!error && data) {
        setEvents(data);
      }
    } catch (error) {
      console.error("Error fetching similar events:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || events.length === 0) return null;

  return (
    <div className="mt-8">
      <h3 className="text-2xl font-bold mb-4">Similar Events</h3>
      <div className="grid md:grid-cols-3 gap-4">
        {events.map((event) => {
          const avgRating = event.event_ratings?.length
            ? (
                event.event_ratings.reduce((sum: number, r: any) => sum + r.rating, 0) /
                event.event_ratings.length
              ).toFixed(1)
            : null;

          return (
            <Link key={event.id} to={`/event/${event.id}`}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20" />
                <div className="p-4">
                  <Badge className="mb-2">{event.category}</Badge>
                  <h4 className="font-semibold mb-2 line-clamp-1">{event.title}</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(event.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {event.location}
                    </div>
                    {avgRating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        {avgRating}
                      </div>
                    )}
                  </div>
                  <p className="font-bold mt-2">
                    {event.is_free ? "Free" : `KSh ${event.price}`}
                  </p>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default SimilarEvents;
