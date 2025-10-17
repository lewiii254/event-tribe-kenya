import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import EventCard from "@/components/EventCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Ticket, Sparkles, Loader2 } from "lucide-react";
import techEvent from "@/assets/events/tech-event.jpg";
import musicEvent from "@/assets/events/music-event.jpg";
import travelEvent from "@/assets/events/travel-event.jpg";
import partyEvent from "@/assets/events/party-event.jpg";
import { Event, type Profile } from "@/types";
import { User } from "@supabase/supabase-js";

interface BookingWithEvent {
  events: Event;
}

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [bookedEvents, setBookedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const checkAuth = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    setUser(session.user);
    await fetchProfile(session.user.id);
    await fetchMyEvents(session.user.id);
    await fetchBookedEvents(session.user.id);
    setLoading(false);
  }, [navigate]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    
    setProfile(data);
  };

  const fetchMyEvents = async (userId: string) => {
    const { data } = await supabase
      .from("events")
      .select("*, bookings (count)")
      .eq("organizer_id", userId)
      .order("date", { ascending: false });

    const eventImages = [techEvent, musicEvent, travelEvent, partyEvent];
    const eventsWithImages = (data || []).map((event, idx) => ({
      ...event,
      image_url: event.image_url || eventImages[idx % eventImages.length],
    }));

    setMyEvents(eventsWithImages);
  };

  const fetchBookedEvents = async (userId: string) => {
    const { data } = await supabase
      .from("bookings")
      .select(`
        *,
        events (
          *,
          profiles:organizer_id (username),
          bookings (count)
        )
      `)
      .eq("user_id", userId);

    const eventImages = [techEvent, musicEvent, travelEvent, partyEvent];
    const events = (data || [])
      .map((booking) => booking.events)
      .filter(Boolean)
      .map((event, idx) => ({
        ...event,
        image_url: event.image_url || eventImages[idx % eventImages.length],
      }));

    setBookedEvents(events);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <Card className="p-8 mb-8 shadow-xl bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border-0">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                {profile?.username?.[0]?.toUpperCase() || "U"}
              </div>
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">
                  {profile?.username || "User"}
                </h1>
                <p className="text-muted-foreground">{user?.email}</p>
              </div>

              <div className="flex gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{myEvents.length}</div>
                  <div className="text-sm text-muted-foreground">Events Created</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-secondary">{bookedEvents.length}</div>
                  <div className="text-sm text-muted-foreground">Events Joined</div>
                </div>
              </div>
            </div>
          </Card>

          <Tabs defaultValue="created" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
              <TabsTrigger value="created" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                My Events
              </TabsTrigger>
              <TabsTrigger value="booked" className="flex items-center gap-2">
                <Ticket className="w-4 h-4" />
                Joined Events
              </TabsTrigger>
            </TabsList>

            <TabsContent value="created" className="space-y-6">
              {myEvents.length === 0 ? (
                <Card className="p-12 text-center">
                  <Sparkles className="w-16 h-16 mx-auto mb-4 text-primary opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">No events yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Start creating amazing events for your community
                  </p>
                  <Button asChild>
                    <a href="/create">Create Your First Event</a>
                  </Button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myEvents.map((event) => (
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
            </TabsContent>

            <TabsContent value="booked" className="space-y-6">
              {bookedEvents.length === 0 ? (
                <Card className="p-12 text-center">
                  <Ticket className="w-16 h-16 mx-auto mb-4 text-secondary opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">No bookings yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Explore and join exciting events near you
                  </p>
                  <Button asChild>
                    <a href="/">Discover Events</a>
                  </Button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {bookedEvents.map((event) => (
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
            </TabsContent>

          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;
