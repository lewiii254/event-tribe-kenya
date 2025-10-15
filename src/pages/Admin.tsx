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

const Admin = () => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [roleForm, setRoleForm] = useState({ userId: "", role: "" });
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      toast.error("Access denied. Admin privileges required.");
      navigate("/");
      return;
    }

    setIsAdmin(true);
    await fetchAdminData();
    setLoading(false);
  };

  const fetchAdminData = async () => {
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("*, user_roles(role)")
      .order("created_at", { ascending: false });

    const { data: eventsData } = await supabase
      .from("events")
      .select("*, profiles:organizer_id(username), bookings(count)")
      .order("created_at", { ascending: false });

    setUsers(profilesData || []);
    setEvents(eventsData || []);
  };

  const assignRole = async () => {
    if (!roleForm.userId || !roleForm.role) {
      toast.error("Please select both user and role");
      return;
    }

    const { error } = await supabase
      .from("user_roles")
      .insert([{ user_id: roleForm.userId, role: roleForm.role as "admin" | "organizer" | "user" }]);

    if (error) {
      toast.error("Failed to assign role");
      return;
    }

    toast.success("Role assigned successfully");
    setRoleForm({ userId: "", role: "" });
    fetchAdminData();
  };

  const deleteEvent = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", eventId);

    if (error) {
      toast.error("Failed to delete event");
      return;
    }

    toast.success("Event deleted successfully");
    fetchAdminData();
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
            <Shield className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold">Admin Panel</h1>
          </div>

          <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="users">Users & Roles</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Assign User Role</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                    <div className="flex items-end">
                      <Button onClick={assignRole} className="w-full">
                        Assign Role
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    All Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {users.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-semibold">{user.username}</h4>
                          <p className="text-sm text-muted-foreground">
                            {user.user_roles?.map((r: any) => r.role).join(", ") || "No roles"}
                          </p>
                        </div>
                        <div className="text-sm text-muted-foreground">
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
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    All Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {events.map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-semibold">{event.title}</h4>
                          <p className="text-sm text-muted-foreground">
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
