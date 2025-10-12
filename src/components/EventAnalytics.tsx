import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Users, Share2, Calendar, TrendingUp, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

interface EventAnalyticsProps {
  eventId: string;
  isOrganizer: boolean;
}

const EventAnalytics = ({ eventId, isOrganizer }: EventAnalyticsProps) => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [totalStats, setTotalStats] = useState({
    totalViews: 0,
    uniqueViews: 0,
    totalBookings: 0,
    totalShares: 0,
  });

  useEffect(() => {
    if (isOrganizer) {
      fetchAnalytics();
    }
  }, [eventId, isOrganizer]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch analytics data
      const { data: analyticsData, error: analyticsError } = await supabase
        .from("event_analytics")
        .select("*")
        .eq("event_id", eventId)
        .order("date", { ascending: true });

      if (analyticsError) throw analyticsError;

      // Calculate totals
      const totals = analyticsData?.reduce(
        (acc, curr) => ({
          totalViews: acc.totalViews + (curr.views || 0),
          uniqueViews: acc.uniqueViews + (curr.unique_views || 0),
          totalBookings: acc.totalBookings + (curr.bookings || 0),
          totalShares: acc.totalShares + (curr.shares || 0),
        }),
        { totalViews: 0, uniqueViews: 0, totalBookings: 0, totalShares: 0 }
      );

      setAnalytics(analyticsData || []);
      setTotalStats(totals || { totalViews: 0, uniqueViews: 0, totalBookings: 0, totalShares: 0 });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOrganizer) {
    return null;
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const chartData = analytics.map((item) => ({
    date: new Date(item.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    views: item.views,
    bookings: item.bookings,
    shares: item.shares,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Event Analytics
        </CardTitle>
        <CardDescription>Track your event's performance and engagement</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Eye className="h-4 w-4 text-blue-500" />
                Total Views
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{totalStats.totalViews}</p>
              <p className="text-xs text-muted-foreground">
                {totalStats.uniqueViews} unique
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-green-500" />
                Total Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{totalStats.totalBookings}</p>
              <p className="text-xs text-muted-foreground">
                {totalStats.totalViews > 0
                  ? ((totalStats.totalBookings / totalStats.totalViews) * 100).toFixed(1)
                  : 0}
                % conversion
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Share2 className="h-4 w-4 text-purple-500" />
                Total Shares
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{totalStats.totalShares}</p>
              <p className="text-xs text-muted-foreground">Social reach</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-orange-500" />
                Tracking Days
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{analytics.length}</p>
              <p className="text-xs text-muted-foreground">Data points</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="views" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="views">Views</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="shares">Shares</TabsTrigger>
          </TabsList>

          <TabsContent value="views" className="mt-4">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="views"
                  stroke="#3b82f6"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="bookings" className="mt-4">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="bookings" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="shares" className="mt-4">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="shares" fill="#a855f7" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default EventAnalytics;
