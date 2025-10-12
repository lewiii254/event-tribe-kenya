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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar, MapPin, Users, Share2, Loader2, Bell } from "lucide-react";
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
import WaitlistButton from "@/components/WaitlistButton";
import CalendarExport from "@/components/CalendarExport";
import GroupBooking from "@/components/GroupBooking";
import EventRecommendations from "@/components/EventRecommendations";
import EventCheckIn from "@/components/EventCheckIn";
import EventAnalytics from "@/components/EventAnalytics";

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
  const [reminders, setReminders] = useState<string[]>([]);

  useEffect(() => {
    const initializePage = async () => {
      // First check auth, then fetch event
      await checkAuth();
      await fetchEvent();
    };

    initializePage();

    // Subscribe to booking updates for realtime QR code and booking count
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
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bookings',
          filter: `event_id=eq.${id}`
        },
        () => {
          // Refetch event to update booking count when anyone books
          fetchEvent();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'bookings',
          filter: `event_id=eq.${id}`
        },
        () => {
          // Refetch event to update booking count when anyone cancels
          fetchEvent();
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

      // Fetch existing reminders
      const { data: reminderData } = await supabase
        .from("event_reminders")
        .select("notification_type")
        .eq("event_id", id)
        .eq("user_id", session.user.id);
      
      if (reminderData) {
        setReminders(reminderData.map(r => r.notification_type));
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
    const shareData = {
      title: event.title,
      text: `Join me at ${event.title}! ${event.description.substring(0, 100)}...`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
      }
    } catch (error) {
      console.error("Share error:", error);
    }
  };

  const shareToSocialMedia = async (platform: string) => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Check out ${event.title}!`);
    
    let shareUrl = "";
    
    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${text}%20${url}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      default:
        return;
    }
    
    // Track share in analytics
    try {
      await supabase.rpc("increment_event_analytics", {
        p_event_id: id,
        p_metric: "shares",
        p_increment: 1,
      });
    } catch (error) {
      console.error("Error tracking share:", error);
    }
    
    window.open(shareUrl, "_blank", "width=600,height=400");
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

  const toggleReminder = async (notificationType: string) => {
    if (!user) {
      toast.error("Please sign in to set reminders");
      navigate("/auth");
      return;
    }

    try {
      if (reminders.includes(notificationType)) {
        // Remove reminder
        await supabase
          .from("event_reminders")
          .delete()
          .eq("event_id", id)
          .eq("user_id", user.id)
          .eq("notification_type", notificationType);
        
        setReminders(reminders.filter(r => r !== notificationType));
        toast.success("Reminder removed");
      } else {
        // Add reminder
        const eventDate = new Date(event.date);
        let reminderTime: Date;

        switch (notificationType) {
          case "1_day":
            reminderTime = new Date(eventDate.getTime() - 24 * 60 * 60 * 1000);
            break;
          case "1_hour":
            reminderTime = new Date(eventDate.getTime() - 60 * 60 * 1000);
            break;
          case "30_min":
            reminderTime = new Date(eventDate.getTime() - 30 * 60 * 1000);
            break;
          default:
            return;
        }

        await supabase
          .from("event_reminders")
          .insert({
            event_id: id,
            user_id: user.id,
            notification_type: notificationType,
            reminder_time: reminderTime.toISOString(),
          });
        
        setReminders([...reminders, notificationType]);
        toast.success("Reminder set successfully");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update reminder");
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
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Bell className="w-5 h-5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56">
                    <div className="grid gap-2">
                      <h4 className="font-medium text-sm mb-2">Set Reminder</h4>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="reminder-1-day"
                            checked={reminders.includes("1_day")}
                            onChange={() => toggleReminder("1_day")}
                            className="h-4 w-4"
                          />
                          <label htmlFor="reminder-1-day" className="text-sm cursor-pointer">
                            1 day before
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="reminder-1-hour"
                            checked={reminders.includes("1_hour")}
                            onChange={() => toggleReminder("1_hour")}
                            className="h-4 w-4"
                          />
                          <label htmlFor="reminder-1-hour" className="text-sm cursor-pointer">
                            1 hour before
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="reminder-30-min"
                            checked={reminders.includes("30_min")}
                            onChange={() => toggleReminder("30_min")}
                            className="h-4 w-4"
                          />
                          <label htmlFor="reminder-30-min" className="text-sm cursor-pointer">
                            30 minutes before
                          </label>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Note: Reminders are shown as browser notifications
                      </p>
                    </div>
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Share2 className="w-5 h-5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56">
                    <div className="grid gap-2">
                      <h4 className="font-medium text-sm mb-2">Share this event</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => shareToSocialMedia("twitter")}
                        className="justify-start"
                      >
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                        </svg>
                        Twitter
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => shareToSocialMedia("facebook")}
                        className="justify-start"
                      >
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                        </svg>
                        Facebook
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => shareToSocialMedia("whatsapp")}
                        className="justify-start"
                      >
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        WhatsApp
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => shareToSocialMedia("linkedin")}
                        className="justify-start"
                      >
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
                          <circle cx="4" cy="4" r="2" />
                        </svg>
                        LinkedIn
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleShare}
                        className="justify-start"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Copy Link
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
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

                {/* Group Booking Option */}
                {!hasBooked && (
                  <div className="mt-3">
                    <GroupBooking
                      event={event}
                      userId={user?.id}
                      onBookingComplete={fetchEvent}
                    />
                  </div>
                )}

                {/* Waitlist Button */}
                {event.max_attendees && (
                  <div className="mt-3">
                    <WaitlistButton
                      eventId={id!}
                      userId={user?.id}
                      isEventFull={
                        (event.bookings?.[0]?.count || 0) >= event.max_attendees
                      }
                      hasBooked={hasBooked}
                      onJoinWaitlist={fetchEvent}
                    />
                  </div>
                )}

                {/* Calendar Export */}
                {(hasBooked || !event.max_attendees || (event.bookings?.[0]?.count || 0) < event.max_attendees) && (
                  <div className="mt-3">
                    <CalendarExport
                      event={{
                        id: event.id,
                        title: event.title,
                        description: event.description,
                        location: event.location,
                        date: event.date,
                      }}
                      userId={user?.id}
                    />
                  </div>
                )}
              </div>
            )}
          </Card>

          <SimilarEvents currentEventId={id!} category={event.category} />

          <div className="mt-6">
            <EventRecommendations
              userId={user?.id}
              currentEventId={id!}
              limit={4}
            />
          </div>

          <AttendeesList eventId={id!} />

          {/* Organizer Tools */}
          {user && event.organizer_id === user.id && (
            <>
              <div className="mt-6">
                <EventAnalytics eventId={id!} isOrganizer={true} />
              </div>

              <div className="mt-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Organizer Tools</h3>
                  <EventCheckIn eventId={id!} isOrganizer={true} />
                </Card>
              </div>
            </>
          )}

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
