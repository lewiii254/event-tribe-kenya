import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Bell, Mail, MessageSquare, Smartphone } from "lucide-react";

interface NotificationPreferencesProps {
  userId: string;
}

const NotificationPreferences = ({ userId }: NotificationPreferencesProps) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState({
    email_enabled: true,
    whatsapp_enabled: false,
    whatsapp_number: "",
    sms_enabled: false,
    push_enabled: true,
  });

  useEffect(() => {
    fetchPreferences();
  }, [userId]);

  const fetchPreferences = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setPreferences({
          email_enabled: data.email_enabled,
          whatsapp_enabled: data.whatsapp_enabled,
          whatsapp_number: data.whatsapp_number || "",
          sms_enabled: data.sms_enabled,
          push_enabled: data.push_enabled,
        });
      }
    } catch (error: any) {
      console.error("Error fetching preferences:", error);
      toast.error("Failed to load notification preferences");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("notification_preferences")
        .upsert({
          user_id: userId,
          ...preferences,
        });

      if (error) throw error;

      toast.success("Notification preferences updated!");
    } catch (error: any) {
      console.error("Error saving preferences:", error);
      toast.error("Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Preferences
        </CardTitle>
        <CardDescription>
          Choose how you want to receive event updates and reminders
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5 flex-1">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="email">Email Notifications</Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Receive booking confirmations and event reminders via email
            </p>
          </div>
          <Switch
            id="email"
            checked={preferences.email_enabled}
            onCheckedChange={(checked) =>
              setPreferences({ ...preferences, email_enabled: checked })
            }
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex-1">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="whatsapp">WhatsApp Notifications</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Get instant updates and reminders on WhatsApp
              </p>
            </div>
            <Switch
              id="whatsapp"
              checked={preferences.whatsapp_enabled}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, whatsapp_enabled: checked })
              }
            />
          </div>
          {preferences.whatsapp_enabled && (
            <div className="ml-6 space-y-2">
              <Label htmlFor="whatsapp-number">WhatsApp Number</Label>
              <Input
                id="whatsapp-number"
                type="tel"
                placeholder="254712345678"
                value={preferences.whatsapp_number}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    whatsapp_number: e.target.value,
                  })
                }
              />
              <p className="text-xs text-muted-foreground">
                Include country code (e.g., 254 for Kenya)
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5 flex-1">
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="sms">SMS Notifications</Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Receive text message notifications
            </p>
          </div>
          <Switch
            id="sms"
            checked={preferences.sms_enabled}
            onCheckedChange={(checked) =>
              setPreferences({ ...preferences, sms_enabled: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5 flex-1">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="push">Push Notifications</Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Get browser push notifications for important updates
            </p>
          </div>
          <Switch
            id="push"
            checked={preferences.push_enabled}
            onCheckedChange={(checked) =>
              setPreferences({ ...preferences, push_enabled: checked })
            }
          />
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Preferences
        </Button>
      </CardContent>
    </Card>
  );
};

export default NotificationPreferences;
