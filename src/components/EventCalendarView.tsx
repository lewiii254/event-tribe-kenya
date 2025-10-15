import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Clock } from "lucide-react";
import { Link } from "react-router-dom";

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  category: string;
  image_url?: string;
  price: number;
  organizer_id: string;
}

const EventCalendarView = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [eventDates, setEventDates] = useState<Date[]>([]);

  useEffect(() => {
    fetchEvents();
  }, [date]);

  const fetchEvents = async () => {
    const { data } = await supabase
      .from("events")
      .select("*")
      .order("date", { ascending: true });

    if (data) {
      setEvents(data as Event[]);
      const dates = data.map((event) => new Date(event.date));
      setEventDates(dates);
    }
  };

  const selectedDateEvents = events.filter((event) => {
    if (!date) return false;
    const eventDate = new Date(event.date);
    return (
      eventDate.toDateString() === date.toDateString()
    );
  });

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Event Calendar</h2>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border"
          modifiers={{
            hasEvent: eventDates,
          }}
          modifiersStyles={{
            hasEvent: {
              fontWeight: "bold",
              textDecoration: "underline",
              color: "hsl(var(--primary))",
            },
          }}
        />
      </Card>

      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">
          {date ? date.toLocaleDateString("en-US", { 
            month: "long", 
            day: "numeric", 
            year: "numeric" 
          }) : "Select a Date"}
        </h2>
        
        {selectedDateEvents.length === 0 ? (
          <p className="text-muted-foreground">No events scheduled for this day</p>
        ) : (
          <div className="space-y-4">
            {selectedDateEvents.map((event) => (
              <Link key={event.id} to={`/event/${event.id}`}>
                <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>
                            {new Date(event.date).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span className="line-clamp-1">{event.location}</span>
                        </div>
                      </div>
                    </div>
                    <Badge>{event.category}</Badge>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default EventCalendarView;
