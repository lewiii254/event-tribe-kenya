-- Create user roles system
CREATE TYPE public.app_role AS ENUM ('admin', 'organizer', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Ticket types table
CREATE TABLE public.ticket_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  quantity_available INTEGER,
  quantity_sold INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sale_starts_at TIMESTAMPTZ,
  sale_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ticket_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ticket types viewable by everyone"
ON public.ticket_types FOR SELECT
USING (true);

CREATE POLICY "Organizers can manage ticket types"
ON public.ticket_types FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.events
    WHERE events.id = ticket_types.event_id
    AND events.organizer_id = auth.uid()
  )
);

-- Discount codes table
CREATE TABLE public.discount_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  code TEXT NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL,
  max_uses INTEGER,
  current_uses INTEGER NOT NULL DEFAULT 0,
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, code)
);

ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organizers can manage discount codes"
ON public.discount_codes FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.events
    WHERE events.id = discount_codes.event_id
    AND events.organizer_id = auth.uid()
  )
);

-- Event budgets and expenses
CREATE TABLE public.event_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL UNIQUE,
  total_budget DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_revenue DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_expenses DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.event_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.event_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organizers can view event budgets"
ON public.event_budgets FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.events
    WHERE events.id = event_budgets.event_id
    AND events.organizer_id = auth.uid()
  )
);

CREATE POLICY "Organizers can manage event budgets"
ON public.event_budgets FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.events
    WHERE events.id = event_budgets.event_id
    AND events.organizer_id = auth.uid()
  )
);

CREATE POLICY "Organizers can manage event expenses"
ON public.event_expenses FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.events
    WHERE events.id = event_expenses.event_id
    AND events.organizer_id = auth.uid()
  )
);

-- Add checked_in_at to bookings if not exists
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMPTZ;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS ticket_type_id UUID REFERENCES public.ticket_types(id);
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS discount_code_id UUID REFERENCES public.discount_codes(id);
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS final_price DECIMAL(10,2);

-- Seating charts
CREATE TABLE public.seating_charts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL UNIQUE,
  layout JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.seats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seating_chart_id UUID REFERENCES public.seating_charts(id) ON DELETE CASCADE NOT NULL,
  seat_number TEXT NOT NULL,
  row_name TEXT NOT NULL,
  section TEXT,
  price DECIMAL(10,2),
  is_available BOOLEAN NOT NULL DEFAULT true,
  booking_id UUID REFERENCES public.bookings(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (seating_chart_id, seat_number, row_name)
);

ALTER TABLE public.seating_charts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Seating charts viewable by everyone"
ON public.seating_charts FOR SELECT
USING (true);

CREATE POLICY "Organizers can manage seating charts"
ON public.seating_charts FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.events
    WHERE events.id = seating_charts.event_id
    AND events.organizer_id = auth.uid()
  )
);

CREATE POLICY "Seats viewable by everyone"
ON public.seats FOR SELECT
USING (true);

CREATE POLICY "Organizers can manage seats"
ON public.seats FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.seating_charts sc
    JOIN public.events e ON e.id = sc.event_id
    WHERE sc.id = seats.seating_chart_id
    AND e.organizer_id = auth.uid()
  )
);