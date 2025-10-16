import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Calendar, MapPin, Users, Loader2 } from "lucide-react";
import { toast } from "sonner";
import techEvent from "@/assets/events/tech-event.jpg";
import QRTicket from "@/components/QRTicket";
import EventRating from "@/components/EventRating";
import RatingDisplay from "@/components/RatingDisplay";
import SimilarEvents from "@/components/SimilarEvents";
import AttendeeList from "@/components/AttendeeList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EventRatings from "@/components/EventRatings";
import FavoriteButton from "@/components/FavoriteButton";
import EventCheckIn from "@/components/EventCheckIn";
import EventWaitlist from "@/components/EventWaitlist";
import ShareEventDialog from "@/components/ShareEventDialog";

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [hasBooked, setHasBooked] = useState(false);
  const [userBooking, setUserBooking] = useState<any>(null);

  useEffect(() => {
    fetchEvent();
    checkAuth();

    // Subscribe to realtime booking updates
    const channel = supabase
      .channel(`event-${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `event_id=eq.${id}`
        },
        () => {
          fetchEvent();
          checkAuth();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);
    
    if (session?.user && id) {
      const { data } = await supabase
        .from("bookings")
        .select("*")
        .eq("event_id", id)
        .eq("user_id", session.user.id)
        .maybeSingle();
      
      if (data) {
        setHasBooked(true);
        setUserBooking(data);
      }
    }
  };

  const fetchEvent = async () => {
    if (!id) {
      navigate("/");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("events")
        .select(`
          *,
          profiles:organizer_id (username),
          bookings (count),
          event_ratings (rating, review, created_at, profiles:user_id (username))
        `)
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching event:", error);
        toast.error("Event not found");
        navigate("/");
        return;
      }

      setEvent({
        ...data,
        image_url: data.image_url || techEvent
      });
    } catch (error: any) {
      console.error("Error:", error);
      toast.error("Failed to load event");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!user) {
      toast.error("Please login to book this event");
      navigate("/auth");
      return;
    }

    setBooking(true);

    try {
      const { error } = await supabase.from("bookings").insert({
        event_id: id,
        user_id: user.id,
        payment_status: "pending"
      });

      if (error) throw error;

      toast.success("Booking initiated! Proceeding to payment...");
      
      // Refresh data
      await checkAuth();
      await fetchEvent();
    } catch (error: any) {
      toast.error(error.message || "Failed to book event");
    } finally {
      setBooking(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!event) {
    return null;
  }

  const isOrganizer = user?.id === event.organizer_id;
  const bookingCount = event.bookings?.[0]?.count || 0;
  const averageRating = event.event_ratings?.length > 0
    ? event.event_ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / event.event_ratings.length
    : 0;
  const isFull = event.max_attendees && bookingCount >= event.max_attendees;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <img
                src={event.image_url}
                alt={event.title}
                className="w-full h-96 object-cover rounded-xl shadow-2xl"
              />

              <div className="mt-6 flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant="secondary" className="text-sm">
                      {event.category}
                    </Badge>
                    {event.is_free && (
                      <Badge variant="outline" className="text-sm">
                        Free
                      </Badge>
                    )}
                  </div>

                  <h1 className="text-4xl font-bold mb-4">{event.title}</h1>

                  <div className="flex flex-col gap-3 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      <span>{new Date(event.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      <span>{event.location}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      <span>{bookingCount} attending</span>
                      {event.max_attendees && (
                        <span className="text-sm">• Max {event.max_attendees}</span>
                      )}
                    </div>
                  </div>

                  {averageRating > 0 && (
                    <div className="mt-4">
                      <RatingDisplay ratings={event.event_ratings} />
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {user && <FavoriteButton eventId={id!} user={user} />}
                  <ShareEventDialog eventTitle={event.title} eventId={id!} />
                </div>
              </div>

              <Tabs defaultValue="details" className="mt-8">
                <TabsList className="grid w-full max-w-md grid-cols-3">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="ratings">Ratings</TabsTrigger>
                  <TabsTrigger value="attendees">Attendees</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-6">
                  <Card className="p-6">
                    <h2 className="text-2xl font-semibold mb-4">About this event</h2>
                    <p className="text-muted-foreground whitespace-pre-wrap">{event.description}</p>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-2">Organizer</h3>
                    <p className="text-muted-foreground">{event.profiles?.username || "Event Organizer"}</p>
                  </Card>

                  {isOrganizer && (
                    <Card className="p-6">
                      <div className="space-y-4">
                        <EventCheckIn eventId={id!} isOrganizer={true} />
                        <Button
                          className="w-full"
                          variant="outline"
                          onClick={() => navigate(`/event/${id}/manage`)}
                        >
                          Manage Event
                        </Button>
                      </div>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="ratings">
                  <EventRatings eventId={id!} user={user} />
                  {hasBooked && user && <EventRating eventId={id!} userId={user.id} onRatingSubmit={fetchEvent} />}
                </TabsContent>

                <TabsContent value="attendees">
                  <Card className="p-6">
                    <AttendeeList eventId={id!} />
                  </Card>
                </TabsContent>
              </Tabs>

              <div className="mt-8">
                <SimilarEvents currentEventId={id!} category={event.category} />
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="space-y-4 sticky top-24">
                <Card className="p-6">
                  <div className="space-y-6">
                    {!event.is_free && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Price</p>
                        <p className="text-3xl font-bold">KSh {event.price}</p>
                      </div>
                    )}

                    {hasBooked ? (
                      <div className="space-y-4">
                        <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                          <p className="text-sm font-medium text-green-800 dark:text-green-200">
                            ✓ You're registered for this event
                          </p>
                        </div>

                        {userBooking?.payment_status === "completed" && userBooking?.qr_code && (
                          <QRTicket
                            bookingId={userBooking.id}
                            qrCode={userBooking.qr_code}
                            eventTitle={event.title}
                            eventDate={event.date}
                          />
                        )}

                        {userBooking?.payment_status === "pending" && (
                          <Button className="w-full" variant="default">
                            Complete Payment
                          </Button>
                        )}
                      </div>
                    ) : (
                      <Button
                        className="w-full"
                        size="lg"
                        onClick={handleBooking}
                        disabled={booking || isFull}
                      >
                        {booking ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Booking...
                          </>
                        ) : isFull ? (
                          "Event Full"
                        ) : (
                          event.is_free ? "Register for Free" : "Book Now"
                        )}
                      </Button>
                    )}

                    {event.max_attendees && (
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Spots filled</span>
                          <span>{bookingCount} / {event.max_attendees}</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${(bookingCount / event.max_attendees) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </Card>

                {isFull && !hasBooked && (
                  <EventWaitlist eventId={id!} userId={user?.id || null} isFull={isFull} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
