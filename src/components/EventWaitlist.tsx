import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Bell, Check } from "lucide-react";

interface EventWaitlistProps {
  eventId: string;
  userId: string | null;
  isFull: boolean;
}

const EventWaitlist = ({ eventId, userId, isFull }: EventWaitlistProps) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [joined, setJoined] = useState(false);

  const handleJoinWaitlist = async () => {
    if (!userId && !email) {
      toast.error("Please enter your email");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("event_waitlist").insert({
        event_id: eventId,
        user_id: userId,
        email: email || null,
      });

      if (error) {
        if (error.code === "23505") {
          toast.info("You're already on the waitlist!");
        } else {
          throw error;
        }
      } else {
        setJoined(true);
        toast.success("You've joined the waitlist! We'll notify you when spots open up.");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to join waitlist";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isFull) return null;

  return (
    <Card className="p-6 border-dashed border-2 border-primary/50 bg-primary/5">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-full bg-primary/10">
          <Bell className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-2">Event is Full!</h3>
          {joined ? (
            <div className="flex items-center gap-2 text-primary">
              <Check className="w-5 h-5" />
              <span className="font-medium">You're on the waitlist</span>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                Join the waitlist to get notified when spots become available
              </p>
              {!userId && (
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mb-3"
                />
              )}
              <Button 
                onClick={handleJoinWaitlist} 
                disabled={loading}
                className="w-full"
              >
                {loading ? "Joining..." : "Join Waitlist"}
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
};

export default EventWaitlist;
