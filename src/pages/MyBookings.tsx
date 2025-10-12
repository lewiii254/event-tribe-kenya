import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Calendar, MapPin, Ticket } from "lucide-react";
import { toast } from "sonner";
import QRTicket from "@/components/QRTicket";
import techEvent from "@/assets/events/tech-event.jpg";

const MyBookings = () => {
  const [bookings, setBookings] = useState<any[]>([]);
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
    fetchBookings(session.user.id);
  };

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
            My Bookings
          </h1>
          <p className="text-muted-foreground text-lg">
            View and manage your event tickets
          </p>
        </div>

        {bookings.length === 0 ? (
          <Card className="p-12 text-center">
            <Ticket className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No bookings yet</h3>
            <p className="text-muted-foreground mb-6">
              Start exploring events and book your first experience!
            </p>
            <Button onClick={() => navigate("/events")}>
              Browse Events
            </Button>
          </Card>
        ) : (
          <div className="grid gap-6">
            {bookings.map((booking) => (
              <Card key={booking.id} className="p-6">
                <div className="grid md:grid-cols-[200px_1fr] gap-6">
                  <img
                    src={booking.events.image_url}
                    alt={booking.events.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold mb-2">
                          {booking.events.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
    </div>
  );
};

export default MyBookings;
