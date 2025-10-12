import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import EventCard from "@/components/EventCard";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Heart } from "lucide-react";
import techEvent from "@/assets/events/tech-event.jpg";
import musicEvent from "@/assets/events/music-event.jpg";
import travelEvent from "@/assets/events/travel-event.jpg";
import partyEvent from "@/assets/events/party-event.jpg";

const Favorites = () => {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    setUser(session.user);
    fetchFavorites(session.user.id);
  };

  const fetchFavorites = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("event_favorites")
        .select(`
          *,
          events (
            *,
            profiles:organizer_id (username, avatar_url),
            bookings (count)
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const eventImages = [techEvent, musicEvent, travelEvent, partyEvent];
      const favoritesWithImages = (data || []).map((fav, idx) => ({
        ...fav,
        events: {
          ...fav.events,
          image_url: fav.events.image_url || eventImages[idx % eventImages.length],
        },
      }));

      setFavorites(favoritesWithImages);
    } catch (error) {
      console.error("Error fetching favorites:", error);
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            My Favorites
          </h1>
          <p className="text-muted-foreground text-lg">
            Events you've saved for later
          </p>
        </div>

        {favorites.length === 0 ? (
          <Card className="p-12 text-center">
            <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No favorites yet</h3>
            <p className="text-muted-foreground">
              Start exploring events and save your favorites!
            </p>
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
