import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Calendar, Download } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CalendarExportProps {
  event: {
    id: string;
    title: string;
    description: string;
    location: string;
    date: string;
  };
  userId: string | undefined;
}

const CalendarExport = ({ event, userId }: CalendarExportProps) => {
  const [exporting, setExporting] = useState(false);

  const generateICalContent = () => {
    const startDate = new Date(event.date);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours duration

    const formatDate = (date: Date) => {
      return date
        .toISOString()
        .replace(/[-:]/g, "")
        .replace(/\.\d{3}/, "");
    };

    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//EventTribe Kenya//Event Calendar//EN
BEGIN:VEVENT
UID:${event.id}@eventtribe.co.ke
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:${event.title}
DESCRIPTION:${event.description.replace(/\n/g, "\\n")}
LOCATION:${event.location}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;
  };

  const trackExport = async (exportType: string) => {
    if (!userId) return;

    try {
      await supabase.from("calendar_exports").insert({
        event_id: event.id,
        user_id: userId,
        export_type: exportType,
      });
    } catch (error) {
      console.error("Error tracking export:", error);
    }
  };

  const exportToICalendar = async () => {
    setExporting(true);
    try {
      const icalContent = generateICalContent();
      const blob = new Blob([icalContent], { type: "text/calendar" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${event.title.replace(/\s+/g, "-")}.ics`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      await trackExport("ical");
      toast.success("Event exported to calendar!");
    } catch (error) {
      toast.error("Failed to export event");
    } finally {
      setExporting(false);
    }
  };

  const exportToGoogleCalendar = async () => {
    setExporting(true);
    try {
      const startDate = new Date(event.date);
      const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

      const formatGoogleDate = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
      };

      const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
        event.title
      )}&dates=${formatGoogleDate(startDate)}/${formatGoogleDate(
        endDate
      )}&details=${encodeURIComponent(
        event.description
      )}&location=${encodeURIComponent(event.location)}`;

      window.open(googleUrl, "_blank");

      await trackExport("google");
      toast.success("Opening Google Calendar...");
    } catch (error) {
      toast.error("Failed to export to Google Calendar");
    } finally {
      setExporting(false);
    }
  };

  const exportToOutlook = async () => {
    setExporting(true);
    try {
      const startDate = new Date(event.date);
      const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

      const formatOutlookDate = (date: Date) => {
        return date.toISOString();
      };

      const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(
        event.title
      )}&startdt=${formatOutlookDate(startDate)}&enddt=${formatOutlookDate(
        endDate
      )}&body=${encodeURIComponent(
        event.description
      )}&location=${encodeURIComponent(event.location)}`;

      window.open(outlookUrl, "_blank");

      await trackExport("outlook");
      toast.success("Opening Outlook Calendar...");
    } catch (error) {
      toast.error("Failed to export to Outlook");
    } finally {
      setExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={exporting}>
          <Calendar className="w-4 h-4 mr-2" />
          Add to Calendar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToGoogleCalendar}>
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.25 16.5h-1.5V17h1.5v1.5zm0-3h-1.5V9h1.5v6.5zm5 3h-1.5V17h1.5v1.5zm0-3h-1.5V9h1.5v6.5z" />
          </svg>
          Google Calendar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToOutlook}>
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 6v12h10V6H7zm3.5 10.5h-1v-7h1v7zm3 0h-1v-7h1v7z" />
          </svg>
          Outlook Calendar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToICalendar}>
          <Download className="w-4 h-4 mr-2" />
          Download iCal
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CalendarExport;
