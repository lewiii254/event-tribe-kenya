-- Add event ratings table
CREATE TABLE public.event_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Enable RLS
ALTER TABLE public.event_ratings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Ratings are viewable by everyone" 
ON public.event_ratings 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create ratings" 
ON public.event_ratings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ratings" 
ON public.event_ratings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ratings" 
ON public.event_ratings 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add event favorites table
CREATE TABLE public.event_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Enable RLS
ALTER TABLE public.event_favorites ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Favorites are viewable by owner" 
ON public.event_favorites 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites" 
ON public.event_favorites 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove favorites" 
ON public.event_favorites 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add event views tracking
CREATE TABLE public.event_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.event_views ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can add views" 
ON public.event_views 
FOR INSERT 
WITH CHECK (true);

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.event_ratings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.event_favorites;