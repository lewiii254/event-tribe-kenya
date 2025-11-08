import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { QrCode, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface EventCheckInProps {
  eventId: string;
  isOrganizer: boolean;
}

const EventCheckIn = ({ eventId, isOrganizer }: EventCheckInProps) => {
  const [qrCode, setQrCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    valid: boolean;
    userName?: string;
    message: string;
  } | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const verifyQRCode = async () => {
    if (!qrCode.trim()) {
      toast.error("Please enter a QR code");
      return;
    }

    setLoading(true);
    setVerificationResult(null);

    try {
      // Extract booking ID from QR code format: EVENTTRIBE-{bookingId}-{timestamp}
      const parts = qrCode.split("-");
      if (parts.length < 2 || parts[0] !== "EVENTTRIBE") {
        throw new Error("Invalid QR code format");
      }

      const bookingId = parts[1];

      // Verify booking exists and matches event
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .select(`
          id,
          event_id,
          payment_status,
          profiles:user_id (username)
        `)
        .eq("id", bookingId)
        .eq("event_id", eventId)
        .maybeSingle();

      if (bookingError) throw bookingError;

      if (!booking) {
        setVerificationResult({
          valid: false,
          message: "Invalid booking or wrong event",
        });
        toast.error("Invalid booking or wrong event");
        return;
      }

      if (booking.payment_status !== "completed") {
        setVerificationResult({
          valid: false,
          userName: booking.profiles?.username,
          message: "Payment not completed",
        });
        toast.error("Payment not completed");
        return;
      }

      // Valid check-in
      setVerificationResult({
        valid: true,
        userName: booking.profiles?.username,
        message: "Valid ticket - Check-in successful!",
      });
      toast.success("Valid ticket - Check-in successful!");

      // Track check-in (you could add a check_in_time column to bookings table)
      await supabase
        .from("bookings")
        .update({ checked_in_at: new Date().toISOString() })
        .eq("id", bookingId);

      setQrCode("");
    } catch (error) {
      console.error("Verification error:", error);
      const errorMessage = error instanceof Error ? error.message : "Verification failed";
      setVerificationResult({
        valid: false,
        message: errorMessage,
      });
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOrganizer) {
    return null;
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <QrCode className="mr-2 h-4 w-4" />
          Check-In System
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md" aria-describedby="checkin-description">
        <DialogHeader>
          <DialogTitle>Event Check-In</DialogTitle>
          <DialogDescription id="checkin-description">
            Scan or enter attendee QR codes to verify tickets
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="Enter QR code (EVENTTRIBE-...)"
              value={qrCode}
              onChange={(e) => setQrCode(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  verifyQRCode();
                }
              }}
            />
            <p className="text-xs text-muted-foreground">
              Or scan QR code with a scanner and paste here
            </p>
          </div>

          <Button onClick={verifyQRCode} disabled={loading} className="w-full">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Verify Ticket
          </Button>

          {verificationResult && (
            <Card
              className={
                verificationResult.valid
                  ? "border-green-500 bg-green-50"
                  : "border-red-500 bg-red-50"
              }
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  {verificationResult.valid ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span className="text-green-700">Valid Ticket</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-red-600" />
                      <span className="text-red-700">Invalid Ticket</span>
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {verificationResult.userName && (
                  <p className="mb-2">
                    <strong>Attendee:</strong> {verificationResult.userName}
                  </p>
                )}
                <p className="text-sm">{verificationResult.message}</p>
              </CardContent>
            </Card>
          )}

          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-semibold">Quick Tips:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Each QR code can only be used once</li>
              <li>Verify payment status before entry</li>
              <li>Keep track of total check-ins</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventCheckIn;
