import { useState, useEffect, useCallback } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Users } from "lucide-react";

interface AttendeeListProps {
  eventId: string;
}

interface Attendee {
  id: string;
  created_at: string;
  payment_status: string;
  profiles: {
    username: string;
    avatar_url?: string;
  } | null;
}

const AttendeeList = ({ eventId }: AttendeeListProps) => {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchAttendees = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          id,
          created_at,
          payment_status,
          profiles:user_id (username, avatar_url)
        `)
        .eq("event_id", eventId)
        .eq("payment_status", "completed")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setAttendees(data as Attendee[]);
      }
    } catch (error) {
      console.error("Error fetching attendees:", error);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchAttendees();

    // Subscribe to realtime booking updates
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

  if (loading) return null;

  const displayedAttendees = showAll ? attendees : attendees.slice(0, 5);

  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5" />
        <h3 className="text-lg font-semibold">
          {attendees.length} {attendees.length === 1 ? 'Person' : 'People'} Going
        </h3>
      </div>

      {attendees.length === 0 ? (
        <p className="text-sm text-muted-foreground">Be the first to book this event!</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-3 mb-3">
            {displayedAttendees.map((attendee) => (
              <div key={attendee.id} className="flex items-center gap-2">
                <Avatar className="h-10 w-10 border-2 border-primary">
                  <AvatarFallback>
                    {attendee.profiles?.username?.[0]?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">
                  {attendee.profiles?.username || "Anonymous"}
                </span>
              </div>
            ))}
          </div>
          
          {attendees.length > 5 && !showAll && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAll(true)}
              className="text-primary"
            >
              +{attendees.length - 5} more
            </Button>
          )}
          
          {showAll && attendees.length > 5 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAll(false)}
              className="text-primary"
            >
              Show less
            </Button>
          )}
        </>
      )}
    </div>
  );
};

export default AttendeeList;
