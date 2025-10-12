import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Users, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface WaitlistButtonProps {
  eventId: string;
  userId: string | undefined;
  isEventFull: boolean;
  hasBooked: boolean;
  onJoinWaitlist?: () => void;
}

const WaitlistButton = ({
  eventId,
  userId,
  isEventFull,
  hasBooked,
  onJoinWaitlist,
}: WaitlistButtonProps) => {
  const [isOnWaitlist, setIsOnWaitlist] = useState(false);
  const [waitlistPosition, setWaitlistPosition] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const checkWaitlistStatus = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from("event_waitlist")
        .select("position")
        .eq("event_id", eventId)
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setIsOnWaitlist(true);
        setWaitlistPosition(data.position);
      }
    } catch (error: any) {
      console.error("Error checking waitlist:", error);
    }
  };

  const handleJoinWaitlist = async () => {
    if (!userId) {
      toast.error("Please sign in to join the waitlist");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from("event_waitlist")
        .insert({
          event_id: eventId,
          user_id: userId,
        });

      if (error) throw error;

      toast.success("You've been added to the waitlist!");
      setIsOnWaitlist(true);
      setDialogOpen(false);
      await checkWaitlistStatus();
      onJoinWaitlist?.();
    } catch (error: any) {
      toast.error(error.message || "Failed to join waitlist");
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveWaitlist = async () => {
    if (!userId) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from("event_waitlist")
        .delete()
        .eq("event_id", eventId)
        .eq("user_id", userId);

      if (error) throw error;

      toast.success("You've been removed from the waitlist");
      setIsOnWaitlist(false);
      setWaitlistPosition(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to leave waitlist");
    } finally {
      setLoading(false);
    }
  };

  // Check waitlist status on mount
  useState(() => {
    checkWaitlistStatus();
  });

  if (!isEventFull || hasBooked) {
    return null;
  }

  if (isOnWaitlist) {
    return (
      <div className="flex items-center gap-2">
        <Button
          onClick={handleLeaveWaitlist}
          disabled={loading}
          variant="outline"
          className="w-full"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Users className="mr-2 h-4 w-4" />
          On Waitlist {waitlistPosition && `(Position ${waitlistPosition})`}
        </Button>
      </div>
    );
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Users className="mr-2 h-4 w-4" />
          Join Waitlist
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join Event Waitlist</DialogTitle>
          <DialogDescription>
            This event is currently full. Join the waitlist to be notified if a
            spot becomes available.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            You'll receive a notification via email if a spot opens up. You can
            leave the waitlist at any time.
          </p>
          <Button onClick={handleJoinWaitlist} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm & Join Waitlist
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WaitlistButton;
