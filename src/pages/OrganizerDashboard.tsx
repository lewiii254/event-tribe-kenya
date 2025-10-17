import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, DollarSign, Users, TrendingUp, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Event } from "@/types";

const OrganizerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalBookings: 0,
    totalRevenue: 0,
    upcomingEvents: 0,
  });
  const navigate = useNavigate();

  const checkOrganizerAccess = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    // Check if user has organizer or admin role OR has created events
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .in("role", ["organizer", "admin"]);

    const { data: eventsData } = await supabase
      .from("events")
      .select("id")
      .eq("organizer_id", session.user.id)
      .limit(1);

    const hasOrganizerRole = roleData && roleData.length > 0;
    const hasCreatedEvents = eventsData && eventsData.length > 0;

    if (!hasOrganizerRole && !hasCreatedEvents) {
      toast.error("Access denied. Create an event first or contact admin for organizer privileges.");
      navigate("/");
      return;
    }

    setIsOrganizer(true);
    await fetchOrganizerData(session.user.id);
    setLoading(false);
  }, [navigate]);

  useEffect(() => {
    checkOrganizerAccess();
  }, [checkOrganizerAccess]);

  const fetchOrganizerData = async (userId: string) => {
    const { data: events } = await supabase
      .from("events")
      .select(`
        *,
        bookings (count),
        event_budgets (total_revenue)
      `)
      .eq("organizer_id", userId)
      .order("date", { ascending: false });

    setMyEvents(events || []);

    const totalBookings = events?.reduce((sum, e) => sum + (e.bookings?.[0]?.count || 0), 0) || 0;
    const totalRevenue = events?.reduce((sum, e) => sum + (e.event_budgets?.[0]?.total_revenue || 0), 0) || 0;
    const upcomingEvents = events?.filter(e => new Date(e.date) > new Date()).length || 0;

    setStats({
      totalEvents: events?.length || 0,
      totalBookings,
      totalRevenue,
      upcomingEvents,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isOrganizer) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">Organizer Dashboard</h1>
            <Button onClick={() => navigate("/create")} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalEvents}</div>
                <p className="text-xs text-muted-foreground">{stats.upcomingEvents} upcoming</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalBookings}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">KSh {stats.totalRevenue.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Avg. Revenue/Event</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  KSh {stats.totalEvents > 0 ? Math.round(stats.totalRevenue / stats.totalEvents).toLocaleString() : 0}
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="events" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="events">My Events</TabsTrigger>
              <TabsTrigger value="finances">Finances</TabsTrigger>
            </TabsList>

            <TabsContent value="events" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Events</CardTitle>
                </CardHeader>
                <CardContent>
                  {myEvents.length === 0 ? (
                    <div className="text-center py-12">
                      <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <h3 className="text-xl font-semibold mb-2">No events yet</h3>
                      <p className="text-muted-foreground mb-6">Create your first event to get started</p>
                      <Button onClick={() => navigate("/create")}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Event
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {myEvents.map((event) => (
                        <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                          <div className="flex-1">
                            <h4 className="font-semibold">{event.title}</h4>
                            <p className="text-sm text-muted-foreground">{new Date(event.date).toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <div className="text-sm font-medium">{event.bookings?.[0]?.count || 0}</div>
                              <div className="text-xs text-muted-foreground">Bookings</div>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => navigate(`/event/${event.id}/manage`)}>
                              Manage
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="finances">
              <Card>
                <CardHeader>
                  <CardTitle>Financial Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Detailed financial reports coming soon</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default OrganizerDashboard;
