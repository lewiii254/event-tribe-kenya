import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Calendar, MapPin, Ticket, X } from "lucide-react";
import { toast } from "sonner";
import QRTicket from "@/components/QRTicket";
import techEvent from "@/assets/events/tech-event.jpg";
import { Booking, Event } from "@/types";
import { User } from "@supabase/supabase-js";

interface BookingWithEvent extends Booking {
  events: Event;
}

const MyBookings = () => {
  const [bookings, setBookings] = useState<BookingWithEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const navigate = useNavigate();

  const checkAuth = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    setUser(session.user);
    fetchBookings(session.user.id);
  }, [navigate]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const fetchBookings = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          events (
            *,
            profiles:organizer_id (username)
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const bookingsWithImages = (data || []).map((booking) => ({
        ...booking,
        events: {
          ...booking.events,
          image_url: booking.events.image_url || techEvent,
        },
      }));

      setBookings(bookingsWithImages);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!cancellingBookingId) return;

    try {
      const { error } = await supabase
        .from("bookings")
        .delete()
        .eq("id", cancellingBookingId);

      if (error) throw error;

      toast.success("Booking cancelled successfully");
      setBookings(bookings.filter((b) => b.id !== cancellingBookingId));
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast.error("Failed to cancel booking");
    } finally {
      setShowCancelDialog(false);
      setCancellingBookingId(null);
    }
  };

  const initiateCancellation = (bookingId: string) => {
    setCancellingBookingId(bookingId);
    setShowCancelDialog(true);
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
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            My Bookings
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
            View and manage your event tickets
          </p>
        </div>

        {bookings.length === 0 ? (
          <Card className="p-8 sm:p-12 text-center">
            <Ticket className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg sm:text-xl font-semibold mb-2">No bookings yet</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-6">
              Start exploring events and book your first experience!
            </p>
            <Button onClick={() => navigate("/events")} className="w-full sm:w-auto">
              Browse Events
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4 sm:gap-6">
            {bookings.map((booking) => (
              <Card key={booking.id} className="p-4 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4 sm:gap-6">
                  <img
                    src={booking.events.image_url}
                    alt={booking.events.title}
                    className="w-full h-40 sm:h-48 object-cover rounded-lg"
                  />
                  
                  <div>
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-3 mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 truncate">
                          {booking.events.title}
                        </h3>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(booking.events.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {booking.events.location}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Badge
                          variant={
                            booking.payment_status === "completed"
                              ? "default"
                              : booking.payment_status === "pending"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {booking.payment_status}
                        </Badge>
                        
                        {new Date(booking.events.date) > new Date() && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => initiateCancellation(booking.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>

                    {booking.qr_code ? (
                      <QRTicket
                        qrCode={booking.qr_code}
                        eventTitle={booking.events.title}
                        eventDate={booking.events.date}
                        bookingId={booking.id}
                      />
                    ) : booking.payment_status === "pending" ? (
                      <div className="p-4 bg-secondary/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          Payment pending. Please complete the M-Pesa payment to get your ticket.
                        </p>
                      </div>
                    ) : null}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Cancellation Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone.
              {cancellingBookingId && bookings.find(b => b.id === cancellingBookingId)?.payment_status === "completed" && (
                <p className="mt-2 text-sm font-medium">
                  Note: Refunds are processed within 5-7 business days.
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Booking</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelBooking}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Cancel Booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyBookings;
