-- Add early bird pricing support to events table
ALTER TABLE public.events
ADD COLUMN early_bird_price DECIMAL(10,2),
ADD COLUMN early_bird_deadline TIMESTAMPTZ,
ADD COLUMN allow_group_booking BOOLEAN DEFAULT false,
ADD COLUMN max_group_size INTEGER DEFAULT 10;

-- Create group bookings table
CREATE TABLE public.group_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  group_leader_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  group_name TEXT,
  number_of_attendees INTEGER NOT NULL,
  payment_status TEXT DEFAULT 'pending',
  total_amount DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS on group_bookings
ALTER TABLE public.group_bookings ENABLE ROW LEVEL SECURITY;

-- Group bookings policies
CREATE POLICY "Users can view own group bookings"
  ON public.group_bookings FOR SELECT
  USING (auth.uid() = group_leader_id);

CREATE POLICY "Users can create group bookings"
  ON public.group_bookings FOR INSERT
  WITH CHECK (auth.uid() = group_leader_id);

CREATE POLICY "Users can update own group bookings"
  ON public.group_bookings FOR UPDATE
  USING (auth.uid() = group_leader_id);

-- Create notification preferences table
CREATE TABLE public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email_enabled BOOLEAN DEFAULT true,
  whatsapp_enabled BOOLEAN DEFAULT false,
  whatsapp_number TEXT,
  sms_enabled BOOLEAN DEFAULT false,
  push_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS on notification_preferences
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Notification preferences policies
CREATE POLICY "Users can view own notification preferences"
  ON public.notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notification preferences"
  ON public.notification_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification preferences"
  ON public.notification_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create calendar exports table to track exported events
CREATE TABLE public.calendar_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  export_type TEXT NOT NULL, -- 'google', 'ical', 'outlook'
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(event_id, user_id, export_type)
);

-- Enable RLS on calendar_exports
ALTER TABLE public.calendar_exports ENABLE ROW LEVEL SECURITY;

-- Calendar exports policies
CREATE POLICY "Users can view own calendar exports"
  ON public.calendar_exports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create calendar exports"
  ON public.calendar_exports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add trigger for notification_preferences updated_at
CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create index for better performance
CREATE INDEX idx_group_bookings_event_id ON public.group_bookings(event_id);
CREATE INDEX idx_group_bookings_group_leader_id ON public.group_bookings(group_leader_id);
CREATE INDEX idx_notification_preferences_user_id ON public.notification_preferences(user_id);
CREATE INDEX idx_calendar_exports_user_id ON public.calendar_exports(user_id);
