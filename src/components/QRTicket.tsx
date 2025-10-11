import { useEffect, useRef } from "react";
import QRCode from "qrcode";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Check } from "lucide-react";
import { toast } from "sonner";

interface QRTicketProps {
  qrCode: string;
  eventTitle: string;
  eventDate: string;
  bookingId: string;
}

const QRTicket = ({ qrCode, eventTitle, eventDate, bookingId }: QRTicketProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && qrCode) {
      QRCode.toCanvas(canvasRef.current, qrCode, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
    }
  }, [qrCode]);

  const handleDownload = () => {
    if (canvasRef.current) {
      const url = canvasRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `ticket-${bookingId}.png`;
      link.href = url;
      link.click();
      toast.success("Ticket downloaded!");
    }
  };

  return (
    <Card className="p-8 text-center bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="flex items-center justify-center gap-2 mb-4 text-green-600">
        <Check className="w-6 h-6" />
        <h3 className="text-2xl font-bold">Payment Successful!</h3>
      </div>
      
      <p className="text-muted-foreground mb-6">
        Your ticket for <strong>{eventTitle}</strong>
      </p>

      <div className="flex justify-center mb-6">
        <canvas ref={canvasRef} className="rounded-lg shadow-lg" />
      </div>

      <div className="space-y-2 mb-6">
        <p className="text-sm text-muted-foreground">
          Event Date: {new Date(eventDate).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
        <p className="text-xs text-muted-foreground">
          Booking ID: {bookingId}
        </p>
      </div>

      <Button onClick={handleDownload} className="w-full">
        <Download className="w-4 h-4 mr-2" />
        Download Ticket
      </Button>

      <p className="text-xs text-muted-foreground mt-4">
        Show this QR code at the event entrance
      </p>
    </Card>
  );
};

export default QRTicket;
