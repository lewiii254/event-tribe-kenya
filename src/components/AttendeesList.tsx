import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users } from "lucide-react";

interface AttendeesListProps {
  eventId: string;
}

interface Attendee {
  id: string;
  profiles: {
    username: string;
    avatar_url?: string;
  } | null;
}

const AttendeesList = ({ eventId }: AttendeesListProps) => {
  const [attendees, setAttendees] = useState<Attendee[]>([]);

  const fetchAttendees = useCallback(async () => {
    const { data } = await supabase
      .from("bookings")
      .select(`
        id,
        profiles (username, avatar_url)
      `)
      .eq("event_id", eventId)
      .eq("payment_status", "completed")
      .limit(12);

    if (data) {
      setAttendees(data as Attendee[]);
    }
  }, [eventId]);

  useEffect(() => {
    fetchAttendees();

    // Subscribe to realtime bookings
    const channel = supabase
      .channel(`attendees-${eventId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `event_id=eq.${eventId}`
        },
        () => {
          fetchAttendees();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId, fetchAttendees]);

  if (attendees.length === 0) return null;

  return (
    <Card className="p-6 mt-6">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-primary" />
        <h3 className="text-xl font-bold">Going ({attendees.length})</h3>
      </div>
      <div className="flex flex-wrap gap-3">
        {attendees.slice(0, 8).map((attendee) => (
          <div key={attendee.id} className="flex items-center gap-2">
            <Avatar className="h-10 w-10">
              <AvatarFallback>
                {attendee.profiles?.username?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">
              {attendee.profiles?.username || "Guest"}
            </span>
          </div>
        ))}
        {attendees.length > 8 && (
          <div className="flex items-center text-sm text-muted-foreground">
            +{attendees.length - 8} more
          </div>
        )}
      </div>
    </Card>
  );
};

export default AttendeesList;
