import Navbar from "@/components/Navbar";
import EventCalendarView from "@/components/EventCalendarView";

const EventCalendar = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Event Calendar
            </h1>
            <p className="text-muted-foreground text-lg">
              View all upcoming events in calendar format
            </p>
          </div>
          <EventCalendarView />
        </div>
      </div>
    </div>
  );
};

export default EventCalendar;
