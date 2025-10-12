import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface GroupBookingProps {
  event: {
    id: string;
    title: string;
    price: number | null;
    is_free: boolean;
    early_bird_price?: number | null;
    early_bird_deadline?: string | null;
    max_group_size?: number;
    allow_group_booking?: boolean;
  };
  userId: string | undefined;
  onBookingComplete?: () => void;
}

const GroupBooking = ({ event, userId, onBookingComplete }: GroupBookingProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [numberOfAttendees, setNumberOfAttendees] = useState(2);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const maxGroupSize = event.max_group_size || 10;

  const calculatePrice = () => {
    if (event.is_free) return 0;

    let pricePerPerson = event.price || 0;

    // Check if early bird pricing is active
    if (
      event.early_bird_price &&
      event.early_bird_deadline &&
      new Date(event.early_bird_deadline) > new Date()
    ) {
      pricePerPerson = event.early_bird_price;
    }

    // Apply group discount (10% off for groups of 5+, 15% off for groups of 10+)
    let discount = 0;
    if (numberOfAttendees >= 10) {
      discount = 0.15;
    } else if (numberOfAttendees >= 5) {
      discount = 0.10;
    }

    const totalPrice = pricePerPerson * numberOfAttendees * (1 - discount);
    return totalPrice;
  };

  const handleGroupBooking = async () => {
    if (!userId) {
      toast.error("Please sign in to make a group booking");
      return;
    }

    if (numberOfAttendees < 2) {
      toast.error("Group booking requires at least 2 attendees");
      return;
    }

    if (numberOfAttendees > maxGroupSize) {
      toast.error(`Maximum group size is ${maxGroupSize} attendees`);
      return;
    }

    if (!groupName.trim()) {
      toast.error("Please enter a group name");
      return;
    }

    if (!event.is_free && !phoneNumber) {
      toast.error("Please enter your phone number for M-Pesa payment");
      return;
    }

    setLoading(true);

    try {
      const totalAmount = calculatePrice();

      const { data: groupBooking, error } = await supabase
        .from("group_bookings")
        .insert({
          event_id: event.id,
          group_leader_id: userId,
          group_name: groupName,
          number_of_attendees: numberOfAttendees,
          payment_status: event.is_free ? "completed" : "pending",
          total_amount: totalAmount,
        })
        .select()
        .single();

      if (error) throw error;

      if (event.is_free) {
        toast.success(
          `Group booking confirmed for ${numberOfAttendees} attendees!`
        );
      } else {
        // Initiate M-Pesa payment for group booking
        const { data, error: paymentError } = await supabase.functions.invoke(
          "mpesa-payment",
          {
            body: {
              bookingId: groupBooking.id,
              phoneNumber: phoneNumber,
              amount: totalAmount,
              isGroupBooking: true,
            },
          }
        );

        if (paymentError) throw paymentError;

        if (data.success) {
          toast.success(data.message);
        } else {
          throw new Error(data.error);
        }
      }

      setDialogOpen(false);
      setGroupName("");
      setNumberOfAttendees(2);
      setPhoneNumber("");
      onBookingComplete?.();
    } catch (error: any) {
      toast.error(error.message || "Failed to create group booking");
    } finally {
      setLoading(false);
    }
  };

  if (!event.allow_group_booking) {
    return null;
  }

  const totalPrice = calculatePrice();
  const pricePerPerson = numberOfAttendees > 0 ? totalPrice / numberOfAttendees : 0;

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Users className="mr-2 h-4 w-4" />
          Book for Group
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Group Booking</DialogTitle>
          <DialogDescription>
            Book multiple tickets for your group and save with group discounts!
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="groupName">Group Name</Label>
            <Input
              id="groupName"
              placeholder="e.g., Tech Club, Friends Group"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="attendees">
              Number of Attendees (2-{maxGroupSize})
            </Label>
            <Input
              id="attendees"
              type="number"
              min="2"
              max={maxGroupSize}
              value={numberOfAttendees}
              onChange={(e) => setNumberOfAttendees(parseInt(e.target.value) || 2)}
            />
          </div>

          {!event.is_free && (
            <div className="space-y-2">
              <Label htmlFor="phone">M-Pesa Phone Number</Label>
              <Input
                id="phone"
                placeholder="254712345678"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
          )}

          {!event.is_free && (
            <div className="rounded-lg bg-muted p-3 space-y-1">
              <div className="flex justify-between text-sm">
                <span>Price per person:</span>
                <span className="font-medium">
                  KES {pricePerPerson.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-semibold">
                <span>Total amount:</span>
                <span>KES {totalPrice.toFixed(2)}</span>
              </div>
              {numberOfAttendees >= 5 && (
                <p className="text-xs text-green-600 mt-2">
                  🎉 {numberOfAttendees >= 10 ? "15%" : "10%"} group discount applied!
                </p>
              )}
            </div>
          )}

          <Button
            onClick={handleGroupBooking}
            disabled={loading}
            className="w-full"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {event.is_free
              ? "Confirm Group Booking"
              : `Pay KES ${totalPrice.toFixed(2)}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GroupBooking;
