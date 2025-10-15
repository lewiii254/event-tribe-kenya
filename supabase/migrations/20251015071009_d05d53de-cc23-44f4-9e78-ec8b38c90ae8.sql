-- Create event waitlist table
CREATE TABLE IF NOT EXISTS public.event_waitlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notified BOOLEAN DEFAULT false,
  UNIQUE(event_id, user_id),
  UNIQUE(event_id, email)
);

-- Enable RLS
ALTER TABLE public.event_waitlist ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can join waitlist"
ON public.event_waitlist
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can view own waitlist entries"
ON public.event_waitlist
FOR SELECT
USING (auth.uid() = user_id OR email IS NOT NULL);

CREATE POLICY "Organizers can view event waitlist"
ON public.event_waitlist
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.events
    WHERE events.id = event_waitlist.event_id
    AND events.organizer_id = auth.uid()
  )
);

-- Create index for faster lookups
CREATE INDEX idx_event_waitlist_event_id ON public.event_waitlist(event_id);
CREATE INDEX idx_event_waitlist_user_id ON public.event_waitlist(user_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.event_waitlist;