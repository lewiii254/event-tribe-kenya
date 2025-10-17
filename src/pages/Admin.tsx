import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Shield, Users, Calendar, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface User {
  id: string;
  username: string;
  created_at: string;
  user_roles?: Array<{ role: string }>;
}

interface Event {
  id: string;
  title: string;
  date: string;
  profiles?: {
    username: string;
  };
  bookings?: Array<{ count: number }>;
}

const Admin = () => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [roleForm, setRoleForm] = useState({ userId: "", role: "" });
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session error:", sessionError);
        toast.error("Failed to verify session");
        navigate("/auth");
        return;
      }

      if (!session) {
        toast.error("Please log in to access the admin panel");
        navigate("/auth");
        return;
      }

      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (roleError) {
        console.error("Role check error:", roleError);
        toast.error("Failed to verify admin access");
        navigate("/");
        return;
      }

      if (!roleData) {
        toast.error("Access denied. Admin privileges required.");
        navigate("/");
        return;
      }

      setIsAdmin(true);
      await fetchAdminData();
      setLoading(false);
    } catch (error) {
      console.error("Admin access check error:", error);
      toast.error("An error occurred while checking admin access");
      navigate("/");
    }
  };

  const fetchAdminData = async () => {
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*, user_roles(role)")
        .order("created_at", { ascending: false });

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        toast.error("Failed to load users");
      }

      const { data: eventsData, error: eventsError } = await supabase
        .from("events")
        .select("*, profiles:organizer_id(username), bookings(count)")
        .order("created_at", { ascending: false });

      if (eventsError) {
        console.error("Error fetching events:", eventsError);
        toast.error("Failed to load events");
      }

      // @ts-expect-error - user_roles relation
      setUsers(profilesData || []);
      setEvents(eventsData || []);
    } catch (error) {
      console.error("Error in fetchAdminData:", error);
      toast.error("An error occurred while loading admin data");
    }
  };

  const assignRole = async () => {
    if (!roleForm.userId || !roleForm.role) {
      toast.error("Please select both user and role");
      return;
    }

    try {
      const { error } = await supabase
        .from("user_roles")
        .upsert([{ user_id: roleForm.userId, role: roleForm.role as "admin" | "organizer" | "user" }], {
          onConflict: 'user_id,role'
        });

      if (error) {
        console.error("Error assigning role:", error);
        toast.error("Failed to assign role: " + error.message);
        return;
      }

      toast.success("Role assigned successfully");
      setRoleForm({ userId: "", role: "" });
      fetchAdminData();
    } catch (error) {
      console.error("Error in assignRole:", error);
      toast.error("An error occurred while assigning role");
    }
  };

  const deleteEvent = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event? This action cannot be undone.")) return;

    try {
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", eventId);

      if (error) {
        console.error("Error deleting event:", error);
        toast.error("Failed to delete event: " + error.message);
        return;
      }

      toast.success("Event deleted successfully");
      fetchAdminData();
    } catch (error) {
      console.error("Error in deleteEvent:", error);
      toast.error("An error occurred while deleting the event");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center gap-3 mb-8">
            <Shield className="w-8 h-8 md:w-10 md:h-10 text-primary" />
            <h1 className="text-2xl md:text-4xl font-bold">Admin Panel</h1>
          </div>

          <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="users" className="text-xs sm:text-sm">Users & Roles</TabsTrigger>
              <TabsTrigger value="events" className="text-xs sm:text-sm">Events</TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl">Assign User Role</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4">
                    <div>
                      <Label htmlFor="user">User</Label>
                      <Select value={roleForm.userId} onValueChange={(value) => setRoleForm({ ...roleForm, userId: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select user" />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.username}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="role">Role</Label>
                      <Select value={roleForm.role} onValueChange={(value) => setRoleForm({ ...roleForm, role: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="organizer">Organizer</SelectItem>
                          <SelectItem value="user">User</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Button onClick={assignRole} className="w-full">
                        Assign Role
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                    <Users className="w-5 h-5" />
                    All Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {users.map((user) => (
                      <div key={user.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-4 border rounded-lg">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold truncate">{user.username}</h4>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {user.user_roles?.map((r: { role: string }) => r.role).join(", ") || "No roles"}
                          </p>
                        </div>
                        <div className="text-xs sm:text-sm text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="events">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                    <Calendar className="w-5 h-5" />
                    All Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {events.map((event) => (
                      <div key={event.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border rounded-lg">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold truncate">{event.title}</h4>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            By {event.profiles?.username} • {new Date(event.date).toLocaleDateString()} • {event.bookings?.[0]?.count || 0} bookings
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => navigate(`/event/${event.id}`)}>
                            View
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => deleteEvent(event.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Admin;
