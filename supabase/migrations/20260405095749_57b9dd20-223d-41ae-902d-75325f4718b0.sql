
-- Role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS for user_roles
CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Websites table
CREATE TABLE public.websites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  short_description TEXT NOT NULL,
  full_description TEXT,
  category TEXT NOT NULL,
  tech_stack TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  price NUMERIC NOT NULL DEFAULT 0,
  preview_url TEXT,
  thumbnail_url TEXT,
  features TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'sold')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.websites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view available websites" ON public.websites
  FOR SELECT USING (status = 'available' OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage websites" ON public.websites
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Buy requests
CREATE TABLE public.buy_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_name TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  buyer_phone TEXT,
  website_id UUID REFERENCES public.websites(id),
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','negotiating','sold','closed')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.buy_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can submit buy requests" ON public.buy_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage buy requests" ON public.buy_requests
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Deploy requests
CREATE TABLE public.deploy_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  project_name TEXT NOT NULL,
  current_url TEXT,
  github_url TEXT,
  website_type TEXT,
  hosting_preference TEXT,
  domain_status TEXT,
  requirements TEXT,
  budget_range TEXT,
  timeline TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','reviewing','quoted','in-progress','deployed','closed')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.deploy_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can submit deploy requests" ON public.deploy_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage deploy requests" ON public.deploy_requests
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Build requests
CREATE TABLE public.build_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company_name TEXT,
  website_types TEXT[] DEFAULT '{}',
  tech_preference TEXT,
  key_features TEXT,
  design_style TEXT,
  has_mockup BOOLEAN DEFAULT false,
  reference_urls TEXT,
  budget_range TEXT,
  timeline TEXT,
  additional_notes TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','reviewing','proposal-sent','in-progress','completed','closed')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.build_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can submit build requests" ON public.build_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage build requests" ON public.build_requests
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Admin settings
CREATE TABLE public.admin_settings (
  key TEXT PRIMARY KEY,
  value TEXT
);
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage settings" ON public.admin_settings
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_websites_updated_at
  BEFORE UPDATE ON public.websites
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
