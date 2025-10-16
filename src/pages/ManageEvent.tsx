import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Loader2, Settings, Ticket, Users, DollarSign, QrCode } from "lucide-react";
import { toast } from "sonner";
import EventCheckIn from "@/components/EventCheckIn";
import AttendeeList from "@/components/AttendeeList";
import TicketTypeManager from "@/components/TicketTypeManager";
import DiscountCodeManager from "@/components/DiscountCodeManager";
import EventFinances from "@/components/EventFinances";
import { Event } from "@/types";

const ManageEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<Event | null>(null);
  const [isOrganizer, setIsOrganizer] = useState(false);

  const checkAccess = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data: eventData } = await supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .single();

    if (!eventData) {
      toast.error("Event not found");
      navigate("/organizer");
      return;
    }

    if (eventData.organizer_id !== session.user.id) {
      toast.error("Access denied. You are not the organizer of this event.");
      navigate("/organizer");
      return;
    }

    setEvent(eventData as Event);
    setIsOrganizer(true);
    setLoading(false);
  }, [id, navigate]);

  useEffect(() => {
    checkAccess();
  }, [checkAccess]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isOrganizer || !event) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">{event.title}</h1>
            <p className="text-muted-foreground">
              {new Date(event.date).toLocaleDateString()} • {event.location}
            </p>
          </div>

          <Tabs defaultValue="attendees" className="w-full">
            <TabsList className="grid w-full max-w-3xl grid-cols-5">
              <TabsTrigger value="attendees" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Attendees
              </TabsTrigger>
              <TabsTrigger value="tickets" className="flex items-center gap-2">
                <Ticket className="h-4 w-4" />
                Tickets
              </TabsTrigger>
              <TabsTrigger value="discounts" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Discounts
              </TabsTrigger>
              <TabsTrigger value="checkin" className="flex items-center gap-2">
                <QrCode className="h-4 w-4" />
                Check-In
              </TabsTrigger>
              <TabsTrigger value="finances" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Finances
              </TabsTrigger>
            </TabsList>

            <TabsContent value="attendees" className="space-y-6">
              <Card className="p-6">
                <AttendeeList eventId={id!} />
              </Card>
            </TabsContent>

            <TabsContent value="tickets">
              <TicketTypeManager eventId={id!} />
            </TabsContent>

            <TabsContent value="discounts">
              <DiscountCodeManager eventId={id!} />
            </TabsContent>

            <TabsContent value="checkin" className="space-y-6">
              <Card className="p-6">
                <EventCheckIn eventId={id!} isOrganizer={true} />
              </Card>
            </TabsContent>

            <TabsContent value="finances">
              <EventFinances eventId={id!} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ManageEvent;
