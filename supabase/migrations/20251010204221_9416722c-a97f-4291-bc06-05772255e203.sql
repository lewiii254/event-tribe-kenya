-- Create enum for event categories
CREATE TYPE event_category AS ENUM ('Tech', 'Music', 'Travel', 'Parties', 'Campus', 'Sports', 'Art', 'Other');

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  interests TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create events table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category event_category NOT NULL,
  image_url TEXT,
  location TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  price DECIMAL(10,2) DEFAULT 0,
  is_free BOOLEAN DEFAULT true,
  max_attendees INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS on events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Events policies
CREATE POLICY "Events are viewable by everyone"
  ON public.events FOR SELECT
  USING (true);

CREATE POLICY "Organizers can create events"
  ON public.events FOR INSERT
  WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers can update own events"
  ON public.events FOR UPDATE
  USING (auth.uid() = organizer_id);

CREATE POLICY "Organizers can delete own events"
  ON public.events FOR DELETE
  USING (auth.uid() = organizer_id);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  payment_status TEXT DEFAULT 'pending',
  payment_phone TEXT,
  qr_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(event_id, user_id)
);

-- Enable RLS on bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Bookings policies
CREATE POLICY "Users can view own bookings"
  ON public.bookings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings"
  ON public.bookings FOR UPDATE
  USING (auth.uid() = user_id);

-- Create event likes table
CREATE TABLE public.event_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(event_id, user_id)
);

-- Enable RLS on event_likes
ALTER TABLE public.event_likes ENABLE ROW LEVEL SECURITY;

-- Event likes policies
CREATE POLICY "Likes are viewable by everyone"
  ON public.event_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can like events"
  ON public.event_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike events"
  ON public.event_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for events updated_at
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user profiles
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();