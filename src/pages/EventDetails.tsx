import { useEffect, useState, useCallback } from "react";
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
import { Event, Booking, getErrorMessage } from "@/types";
import { User } from "@supabase/supabase-js";

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [hasBooked, setHasBooked] = useState(false);
  const [userBooking, setUserBooking] = useState<Booking | null>(null);

  const checkAuth = useCallback(async () => {
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
  }, [id]);

  const fetchEvent = useCallback(async () => {
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
      } as Event);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to load event");
      navigate("/");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

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
  }, [id, checkAuth, fetchEvent]);


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
    } catch (error) {
      toast.error(getErrorMessage(error));
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
  const averageRating = event.event_ratings?.length
    ? event.event_ratings.reduce((sum, r) => sum + r.rating, 0) / event.event_ratings.length
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
                className="w-full h-64 sm:h-80 md:h-96 object-cover rounded-xl shadow-2xl"
              />

              <div className="mt-6 flex flex-col sm:flex-row items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                    <Badge variant="secondary" className="text-xs sm:text-sm">
                      {event.category}
                    </Badge>
                    {event.is_free && (
                      <Badge variant="outline" className="text-xs sm:text-sm">
                        Free
                      </Badge>
                    )}
                  </div>

                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">{event.title}</h1>

                  <div className="flex flex-col gap-3 text-sm sm:text-base text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                      <span className="text-xs sm:text-sm md:text-base">{new Date(event.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                      <span className="text-xs sm:text-sm md:text-base">{event.location}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                      <span className="text-xs sm:text-sm md:text-base">{bookingCount} attending</span>
                      {event.max_attendees && (
                        <span className="text-xs sm:text-sm">• Max {event.max_attendees}</span>
                      )}
                    </div>
                  </div>

                  {averageRating > 0 && (
                    <div className="mt-4">
                      <RatingDisplay ratings={event.event_ratings} />
                    </div>
                  )}
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  {user && <FavoriteButton eventId={id!} user={user} />}
                  <ShareEventDialog eventTitle={event.title} eventId={id!} />
                </div>
              </div>

              <Tabs defaultValue="details" className="mt-8">
                <TabsList className="grid w-full max-w-md grid-cols-3">
                  <TabsTrigger value="details" className="text-xs sm:text-sm">Details</TabsTrigger>
                  <TabsTrigger value="ratings" className="text-xs sm:text-sm">Ratings</TabsTrigger>
                  <TabsTrigger value="attendees" className="text-xs sm:text-sm">Attendees</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-6">
                  <Card className="p-4 sm:p-6">
                    <h2 className="text-xl sm:text-2xl font-semibold mb-4">About this event</h2>
                    <p className="text-sm sm:text-base text-muted-foreground whitespace-pre-wrap">{event.description}</p>
                  </Card>

                  <Card className="p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-semibold mb-2">Organizer</h3>
                    <p className="text-sm sm:text-base text-muted-foreground">{event.profiles?.username || "Event Organizer"}</p>
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
