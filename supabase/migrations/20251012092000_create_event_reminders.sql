-- Create event reminders table
CREATE TABLE public.event_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reminder_time TIMESTAMPTZ NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('1_day', '1_hour', '30_min')),
  is_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(event_id, user_id, notification_type)
);

-- Enable RLS
ALTER TABLE public.event_reminders ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own reminders"
  ON public.event_reminders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create reminders"
  ON public.event_reminders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reminders"
  ON public.event_reminders FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own reminders"
  ON public.event_reminders FOR UPDATE
  USING (auth.uid() = user_id);

-- Create index for efficient querying
CREATE INDEX idx_event_reminders_user_id ON public.event_reminders(user_id);
CREATE INDEX idx_event_reminders_event_id ON public.event_reminders(event_id);
CREATE INDEX idx_event_reminders_reminder_time ON public.event_reminders(reminder_time);
