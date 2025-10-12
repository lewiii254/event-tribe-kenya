import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Calendar, MapPin, Users, Share2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import techEvent from "@/assets/events/tech-event.jpg";
import EventComments from "@/components/EventComments";
import QRTicket from "@/components/QRTicket";
import EventRating from "@/components/EventRating";
import RatingDisplay from "@/components/RatingDisplay";
import SimilarEvents from "@/components/SimilarEvents";
import AttendeeList from "@/components/AttendeeList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EventRatings from "@/components/EventRatings";
import FavoriteButton from "@/components/FavoriteButton";
import AttendeesList from "@/components/AttendeesList";

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [hasBooked, setHasBooked] = useState(false);
  const [userBooking, setUserBooking] = useState<any>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);
  const [showBookingDialog, setShowBookingDialog] = useState(false);

  useEffect(() => {
    const initializePage = async () => {
      // First check auth, then fetch event
      await checkAuth();
      await fetchEvent();
    };

    initializePage();

    // Subscribe to booking updates for realtime QR code
    const channel = supabase
      .channel(`booking-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings',
          filter: `event_id=eq.${id}`
        },
        (payload) => {
          if (payload.new.user_id === user?.id) {
            setUserBooking(payload.new);
          }
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

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("events")
        .select(`
          *,
          profiles:organizer_id (username, avatar_url),
          bookings (count),
          event_ratings (rating, review, user_id, created_at)
        `)
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching event:", error);
        throw error;
      }

      if (!data) {
        toast.error("Event not found");
        navigate("/");
        return;
      }

      setEvent({
        ...data,
        image_url: data.image_url || techEvent,
      });

      // Track event view - get current user
      const { data: { session } } = await supabase.auth.getSession();
      
      await supabase.from("event_views").insert({
        event_id: id,
        user_id: session?.user?.id || null,
      });
    } catch (error) {
      console.error("Error fetching event:", error);
      toast.error("Failed to load event. Please try again.");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!user) {
      toast.error("Please sign in to book this event");
      navigate("/auth");
      return;
    }

    if (!event.is_free && !phoneNumber) {
      toast.error("Please enter your phone number for M-Pesa payment");
      return;
    }

    // Close the dialog and start booking
    setShowBookingDialog(false);
    setBooking(true);

    try {
      const { data: newBooking, error } = await supabase
        .from("bookings")
        .insert({
          event_id: id,
          user_id: user.id,
          payment_status: event.is_free ? "completed" : "pending",
        })
        .select()
        .single();

      if (error) throw error;

      if (event.is_free) {
        // Generate QR for free events immediately
        const qrCodeData = `EVENTTRIBE-${newBooking.id}-${Date.now()}`;
        await supabase
          .from("bookings")
          .update({ qr_code: qrCodeData })
          .eq("id", newBooking.id);
        
        setUserBooking({ ...newBooking, qr_code: qrCodeData });
        toast.success("Event booked successfully!");
      } else {
        // Initiate M-Pesa payment
        const { data, error: paymentError } = await supabase.functions.invoke(
          "mpesa-payment",
          {
            body: {
              bookingId: newBooking.id,
              phoneNumber: phoneNumber,
            },
          }
        );

        if (paymentError) throw paymentError;

        if (data.success) {
          toast.success(data.message);
          setUserBooking(newBooking);
        } else {
          throw new Error(data.error);
        }
      }

      setHasBooked(true);
      fetchEvent();
    } catch (error: any) {
      toast.error(error.message || "Failed to book event");
    } finally {
      setBooking(false);
    }
  };

  const initiateBooking = () => {
    if (!user) {
      toast.error("Please sign in to book this event");
      navigate("/auth");
      return;
    }

    // Check if event is at capacity
    if (event.max_attendees) {
      const currentAttendees = event.bookings?.[0]?.count || 0;
      if (currentAttendees >= event.max_attendees) {
        toast.error("This event is at full capacity");
        return;
      }
    }
    
    setShowBookingDialog(true);
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: event.title,
          text: event.description,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
      }
    } catch (error) {
      console.error("Share error:", error);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      toast.error("Please sign in to save favorites");
      navigate("/auth");
      return;
    }

    try {
      if (isFavorite && favoriteId) {
        await supabase.from("event_favorites").delete().eq("id", favoriteId);
        setIsFavorite(false);
        setFavoriteId(null);
        toast.success("Removed from favorites");
      } else {
        const { data, error } = await supabase
          .from("event_favorites")
          .insert({ event_id: id, user_id: user.id })
          .select()
          .single();
        
        if (error) throw error;
        
        setIsFavorite(true);
        setFavoriteId(data.id);
        toast.success("Added to favorites");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update favorites");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!event) return null;

  const formattedDate = new Date(event.date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const categoryColors: Record<string, string> = {
    Tech: "bg-accent text-accent-foreground",
    Music: "bg-secondary text-secondary-foreground",
    Travel: "bg-primary text-primary-foreground",
    Parties: "bg-secondary text-secondary-foreground",
    Campus: "bg-accent text-accent-foreground",
    Sports: "bg-primary text-primary-foreground",
    Art: "bg-secondary text-secondary-foreground",
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-16">
        <div className="relative h-[60vh] overflow-hidden">
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        </div>

        <div className="container mx-auto px-4 -mt-32 relative z-10">
          <Card className="p-8 shadow-2xl max-w-4xl mx-auto bg-card/95 backdrop-blur-sm">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <Badge className={categoryColors[event.category] || "bg-primary"}>
                  {event.category}
                </Badge>
                <h1 className="text-4xl font-bold mt-4 mb-2">{event.title}</h1>
                <p className="text-muted-foreground">
                  by {event.profiles?.username || "Unknown"}
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={handleShare}>
                  <Share2 className="w-5 h-5" />
                </Button>
                <FavoriteButton eventId={id!} user={user} />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-8 p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{formattedDate}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-secondary" />
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{event.location}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-accent" />
                <div>
                  <p className="text-sm text-muted-foreground">Attending</p>
                  <p className="font-medium">
                    {event.bookings?.[0]?.count || 0} people
                    {event.max_attendees && ` / ${event.max_attendees}`}
                  </p>
                  {event.max_attendees && (
                    <div className="mt-1">
                      {(() => {
                        const percentage = ((event.bookings?.[0]?.count || 0) / event.max_attendees) * 100;
                        return (
                          <>
                            <div className="w-full bg-muted-foreground/20 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full transition-all ${
                                  percentage >= 90
                                    ? "bg-destructive"
                                    : percentage >= 70
                                    ? "bg-yellow-500"
                                    : "bg-primary"
                                }`}
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                              />
                            </div>
                            {percentage >= 90 && (
                              <p className="text-xs text-destructive mt-1">Almost full!</p>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="prose max-w-none mb-8">
              <h3 className="text-xl font-semibold mb-3">About This Event</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{event.description}</p>
            </div>

            <AttendeeList eventId={id!} />

            <Tabs defaultValue="details" className="mt-8">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="ratings">
                  Ratings ({event.event_ratings?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="discussion">Discussion</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="mt-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Organizer</h4>
                    <p className="text-muted-foreground">
                      {event.profiles?.username || "Unknown"}
                    </p>
                  </div>
                  {event.max_attendees && (
                    <div>
                      <h4 className="font-semibold mb-2">Capacity</h4>
                      <p className="text-muted-foreground">
                        {event.bookings?.[0]?.count || 0} / {event.max_attendees} spots filled
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="ratings" className="mt-6">
                {user && hasBooked && userBooking?.payment_status === "completed" && (
                  <div className="mb-6 p-4 border rounded-lg">
                    <EventRating
                      eventId={id!}
                      userId={user.id}
                      existingRating={event.event_ratings?.find((r: any) => r.user_id === user.id)}
                      onRatingSubmit={fetchEvent}
                    />
                  </div>
                )}
                <RatingDisplay ratings={event.event_ratings || []} />
              </TabsContent>

              <TabsContent value="discussion" className="mt-6">
                <EventComments eventId={id!} user={user} />
              </TabsContent>
            </Tabs>

            {userBooking?.qr_code ? (
              <div className="pt-6 border-t border-border">
                <QRTicket
                  qrCode={userBooking.qr_code}
                  eventTitle={event.title}
                  eventDate={event.date}
                  bookingId={userBooking.id}
                />
              </div>
            ) : (
              <div className="pt-6 border-t border-border">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Price</p>
                    {event.is_free ? (
                      <p className="text-3xl font-bold text-primary">Free</p>
                    ) : (
                      <p className="text-3xl font-bold">KSh {event.price}</p>
                    )}
                  </div>
                </div>

                {!event.is_free && !hasBooked && (
                  <Input
                    type="tel"
                    placeholder="M-Pesa Phone (e.g., 0712345678)"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="mb-4"
                  />
                )}

                <Button
                  size="lg"
                  className="w-full bg-primary hover:bg-primary/90 px-8 py-6 text-lg"
                  onClick={initiateBooking}
                  disabled={booking || hasBooked}
                >
                  {booking ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {event.is_free ? "Booking..." : "Processing Payment..."}
                    </>
                  ) : hasBooked ? (
                    userBooking?.payment_status === 'pending' ? "Payment Pending..." : "Already Booked"
                  ) : (
                    event.is_free ? "Book Now" : "Pay with M-Pesa"
                  )}
                </Button>
              </div>
            )}
          </Card>

          <SimilarEvents currentEventId={id!} category={event.category} />

          <AttendeesList eventId={id!} />

          <Card className="p-8 mt-6">
            <EventRatings eventId={id!} user={user} />
          </Card>

          <Card className="p-8 mt-6">
            <EventComments eventId={id!} user={user} />
          </Card>
        </div>
      </div>

      {/* Booking Confirmation Dialog */}
      <AlertDialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Booking</AlertDialogTitle>
            <AlertDialogDescription>
              {event.is_free ? (
                <>
                  You're about to book <strong>{event.title}</strong> for free.
                  <br />
                  <br />
                  Click confirm to proceed with your booking.
                </>
              ) : (
                <>
                  You're about to book <strong>{event.title}</strong> for <strong>KSh {event.price}</strong>.
                  <br />
                  <br />
                  Please ensure your M-Pesa phone number ({phoneNumber}) is correct before proceeding.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBooking}>
              Confirm Booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EventDetails;
