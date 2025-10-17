import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { Loader2, Upload } from "lucide-react";
import { User } from "@supabase/supabase-js";
import { Database } from "@/integrations/supabase/types";
import { getErrorMessage } from "@/types";

type EventCategory = Database["public"]["Enums"]["event_category"];

const categories = ["Tech", "Music", "Travel", "Parties", "Campus", "Sports", "Art", "Other"];

const CreateEvent = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Tech",
    location: "",
    date: "",
    price: "0",
    isFree: true,
    maxAttendees: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      const { error } = await supabase.from("events").insert({
        organizer_id: user.id,
        title: formData.title,
        description: formData.description,
        category: formData.category as EventCategory,
        location: formData.location,
        date: new Date(formData.date).toISOString(),
        price: parseFloat(formData.price),
        is_free: formData.isFree,
        max_attendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : null,
      });

      if (error) throw error;

      toast.success("Event created successfully!");
      navigate("/");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    if (field === "isFree") {
      setFormData((prev) => ({ ...prev, price: value ? "0" : prev.price }));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Create Your Event
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
              Share your event with the community
            </p>
          </div>

          <Card className="p-4 sm:p-6 md:p-8 shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  placeholder="Amazing Tech Meetup"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  required
                  className="border-2 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Tell us about your event..."
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  required
                  rows={5}
                  className="border-2 focus:border-primary resize-none"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleChange("category", value)}
                  >
                    <SelectTrigger className="border-2 focus:border-primary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Date & Time *</Label>
                  <Input
                    id="date"
                    type="datetime-local"
                    value={formData.date}
                    onChange={(e) => handleChange("date", e.target.value)}
                    required
                    className="border-2 focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  placeholder="Nairobi, Kenya"
                  value={formData.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                  required
                  className="border-2 focus:border-primary"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (KSh)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.price}
                    onChange={(e) => handleChange("price", e.target.value)}
                    disabled={formData.isFree}
                    className="border-2 focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxAttendees">Max Attendees (Optional)</Label>
                  <Input
                    id="maxAttendees"
                    type="number"
                    min="1"
                    placeholder="Unlimited"
                    value={formData.maxAttendees}
                    onChange={(e) => handleChange("maxAttendees", e.target.value)}
                    className="border-2 focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isFree"
                  checked={formData.isFree}
                  onChange={(e) => handleChange("isFree", e.target.checked)}
                  className="w-4 h-4 text-primary rounded focus:ring-primary"
                />
                <Label htmlFor="isFree" className="cursor-pointer">
                  This is a free event
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-lg py-6"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Event...
                  </>
                ) : (
                  "Create Event"
                )}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;
