import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import EventCard from "@/components/EventCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Heart } from "lucide-react";
import { toast } from "sonner";
import { Event } from "@/types";

interface FavoriteWithEvent {
  id: string;
  events: Event;
}

const Favorites = () => {
  const [favorites, setFavorites] = useState<FavoriteWithEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const checkAuth = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    fetchFavorites(session.user.id);
  }, [navigate]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const fetchFavorites = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("event_favorites")
        .select(`
          id,
          events (
            *,
            profiles:organizer_id (username),
            bookings (count)
          )
        `)
        .eq("user_id", userId);

      if (error) throw error;
      setFavorites(data || []);
    } catch (error) {
      toast.error("Failed to load favorites");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center items-center h-[80vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
          My Favorites
        </h1>

        {favorites.length === 0 ? (
          <Card className="p-12 text-center">
            <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No favorites yet</h3>
            <Button onClick={() => navigate("/events")}>Browse Events</Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((fav) => (
              <EventCard
                key={fav.id}
                id={fav.events.id}
                title={fav.events.title}
                category={fav.events.category}
                image={fav.events.image_url}
                location={fav.events.location}
                date={fav.events.date}
                price={fav.events.price}
                isFree={fav.events.is_free}
                attendeeCount={fav.events.bookings?.[0]?.count || 0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
