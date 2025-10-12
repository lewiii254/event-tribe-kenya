-- Create event waitlist table
CREATE TABLE public.event_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  position INTEGER,
  notified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(event_id, user_id)
);

-- Enable RLS on event_waitlist
ALTER TABLE public.event_waitlist ENABLE ROW LEVEL SECURITY;

-- Waitlist policies
CREATE POLICY "Users can view waitlist entries"
  ON public.event_waitlist FOR SELECT
  USING (true);

CREATE POLICY "Users can join waitlist"
  ON public.event_waitlist FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove themselves from waitlist"
  ON public.event_waitlist FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update waitlist positions
CREATE OR REPLACE FUNCTION update_waitlist_positions()
RETURNS TRIGGER AS $$
BEGIN
  -- Update positions for the affected event
  UPDATE public.event_waitlist
  SET position = subquery.row_num
  FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as row_num
    FROM public.event_waitlist
    WHERE event_id = COALESCE(NEW.event_id, OLD.event_id)
  ) AS subquery
  WHERE event_waitlist.id = subquery.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to maintain waitlist positions
CREATE TRIGGER update_waitlist_positions_trigger
  AFTER INSERT OR DELETE ON public.event_waitlist
  FOR EACH ROW
  EXECUTE FUNCTION update_waitlist_positions();

-- Create event analytics table for tracking views and engagement
CREATE TABLE public.event_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  date DATE DEFAULT CURRENT_DATE NOT NULL,
  views INTEGER DEFAULT 0,
  unique_views INTEGER DEFAULT 0,
  bookings INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  UNIQUE(event_id, date)
);

-- Enable RLS on event_analytics
ALTER TABLE public.event_analytics ENABLE ROW LEVEL SECURITY;

-- Analytics policies - only organizers can view their event analytics
CREATE POLICY "Organizers can view own event analytics"
  ON public.event_analytics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = event_analytics.event_id
      AND events.organizer_id = auth.uid()
    )
  );

-- Create function to increment analytics
CREATE OR REPLACE FUNCTION increment_event_analytics(
  p_event_id UUID,
  p_metric TEXT,
  p_increment INTEGER DEFAULT 1
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.event_analytics (event_id, date, views, unique_views, bookings, shares)
  VALUES (
    p_event_id,
    CURRENT_DATE,
    CASE WHEN p_metric = 'views' THEN p_increment ELSE 0 END,
    CASE WHEN p_metric = 'unique_views' THEN p_increment ELSE 0 END,
    CASE WHEN p_metric = 'bookings' THEN p_increment ELSE 0 END,
    CASE WHEN p_metric = 'shares' THEN p_increment ELSE 0 END
  )
  ON CONFLICT (event_id, date)
  DO UPDATE SET
    views = event_analytics.views + CASE WHEN p_metric = 'views' THEN p_increment ELSE 0 END,
    unique_views = event_analytics.unique_views + CASE WHEN p_metric = 'unique_views' THEN p_increment ELSE 0 END,
    bookings = event_analytics.bookings + CASE WHEN p_metric = 'bookings' THEN p_increment ELSE 0 END,
    shares = event_analytics.shares + CASE WHEN p_metric = 'shares' THEN p_increment ELSE 0 END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add index for better performance
CREATE INDEX idx_event_waitlist_event_id ON public.event_waitlist(event_id);
CREATE INDEX idx_event_waitlist_user_id ON public.event_waitlist(user_id);
CREATE INDEX idx_event_analytics_event_date ON public.event_analytics(event_id, date);
