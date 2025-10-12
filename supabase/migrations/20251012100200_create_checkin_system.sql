-- Add check-in tracking to bookings table
ALTER TABLE public.bookings
ADD COLUMN checked_in_at TIMESTAMPTZ;

-- Create index for faster check-in queries
CREATE INDEX idx_bookings_checked_in ON public.bookings(checked_in_at) WHERE checked_in_at IS NOT NULL;

-- Add event tags for better categorization and search
CREATE TABLE public.event_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  tag TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS on event_tags
ALTER TABLE public.event_tags ENABLE ROW LEVEL SECURITY;

-- Event tags policies
CREATE POLICY "Tags are viewable by everyone"
  ON public.event_tags FOR SELECT
  USING (true);

CREATE POLICY "Organizers can manage event tags"
  ON public.event_tags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = event_tags.event_id
      AND events.organizer_id = auth.uid()
    )
  );

-- Create event collaborators table for multi-organizer support
CREATE TABLE public.event_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'collaborator', -- 'collaborator', 'moderator'
  can_edit BOOLEAN DEFAULT false,
  can_checkin BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(event_id, user_id)
);

-- Enable RLS on event_collaborators
ALTER TABLE public.event_collaborators ENABLE ROW LEVEL SECURITY;

-- Event collaborators policies
CREATE POLICY "Collaborators viewable by event organizer and collaborators"
  ON public.event_collaborators FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = event_collaborators.event_id
      AND events.organizer_id = auth.uid()
    )
  );

CREATE POLICY "Organizers can manage collaborators"
  ON public.event_collaborators FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = event_collaborators.event_id
      AND events.organizer_id = auth.uid()
    )
  );

-- Create event check-in stats view
CREATE OR REPLACE VIEW event_checkin_stats AS
SELECT 
  e.id as event_id,
  e.title,
  COUNT(b.id) as total_bookings,
  COUNT(b.checked_in_at) as checked_in_count,
  COUNT(b.id) - COUNT(b.checked_in_at) as pending_checkin,
  ROUND(
    CASE 
      WHEN COUNT(b.id) > 0 
      THEN (COUNT(b.checked_in_at)::decimal / COUNT(b.id)::decimal) * 100 
      ELSE 0 
    END, 
    2
  ) as checkin_percentage
FROM public.events e
LEFT JOIN public.bookings b ON e.id = b.event_id AND b.payment_status = 'completed'
GROUP BY e.id, e.title;

-- Grant access to the view
GRANT SELECT ON event_checkin_stats TO authenticated;

-- Create indexes for better performance
CREATE INDEX idx_event_tags_event_id ON public.event_tags(event_id);
CREATE INDEX idx_event_tags_tag ON public.event_tags(tag);
CREATE INDEX idx_event_collaborators_event_id ON public.event_collaborators(event_id);
CREATE INDEX idx_event_collaborators_user_id ON public.event_collaborators(user_id);
