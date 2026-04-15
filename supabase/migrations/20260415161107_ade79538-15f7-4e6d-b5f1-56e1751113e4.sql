
-- Sites table (the 23 .fan communities)
CREATE TABLE public.sites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  emoji TEXT NOT NULL DEFAULT '⭐',
  accent_color TEXT NOT NULL DEFAULT '#0C447C',
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sites are publicly readable" ON public.sites FOR SELECT USING (true);

-- Users table
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  initials TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users are publicly readable" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own record" ON public.users FOR UPDATE USING (auth.uid() = auth_id);
CREATE POLICY "Users can insert own record" ON public.users FOR INSERT WITH CHECK (auth.uid() = auth_id);

-- Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  bio TEXT,
  headline TEXT,
  location TEXT,
  hire_available BOOLEAN NOT NULL DEFAULT false,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are publicly readable" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (
  user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (
  user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
);

-- Social links table
CREATE TABLE public.social_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  handle TEXT,
  url TEXT,
  follower_count INTEGER NOT NULL DEFAULT 0,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Social links are publicly readable" ON public.social_links FOR SELECT USING (true);
CREATE POLICY "Users can manage own social links" ON public.social_links FOR INSERT WITH CHECK (
  user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
);
CREATE POLICY "Users can update own social links" ON public.social_links FOR UPDATE USING (
  user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
);
CREATE POLICY "Users can delete own social links" ON public.social_links FOR DELETE USING (
  user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
);

-- Fan clubs table
CREATE TABLE public.fan_clubs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  site_id UUID REFERENCES public.sites(id),
  name TEXT NOT NULL,
  description TEXT,
  member_count INTEGER NOT NULL DEFAULT 0,
  is_free BOOLEAN NOT NULL DEFAULT true,
  price NUMERIC(10,2) DEFAULT 0,
  accent_color TEXT DEFAULT '#0C447C',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.fan_clubs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Fan clubs are publicly readable" ON public.fan_clubs FOR SELECT USING (true);
CREATE POLICY "Owners can manage fan clubs" ON public.fan_clubs FOR INSERT WITH CHECK (
  owner_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
);
CREATE POLICY "Owners can update fan clubs" ON public.fan_clubs FOR UPDATE USING (
  owner_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
);
CREATE POLICY "Owners can delete fan clubs" ON public.fan_clubs FOR DELETE USING (
  owner_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
);

-- Brand collaborations table
CREATE TABLE public.brand_collabs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  site_id UUID REFERENCES public.sites(id),
  brand_name TEXT NOT NULL,
  brand_logo_url TEXT,
  role TEXT,
  year INTEGER,
  reach INTEGER DEFAULT 0,
  engagement_rate NUMERIC(5,2) DEFAULT 0,
  post_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.brand_collabs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Brand collabs are publicly readable" ON public.brand_collabs FOR SELECT USING (true);
CREATE POLICY "Users can manage own collabs" ON public.brand_collabs FOR INSERT WITH CHECK (
  user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
);
CREATE POLICY "Users can update own collabs" ON public.brand_collabs FOR UPDATE USING (
  user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
);
CREATE POLICY "Users can delete own collabs" ON public.brand_collabs FOR DELETE USING (
  user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
);

-- Passion points table
CREATE TABLE public.passion_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  points INTEGER NOT NULL DEFAULT 0,
  level TEXT NOT NULL DEFAULT 'enthusiast' CHECK (level IN ('enthusiast', 'contributor', 'expert', 'authority', 'legend')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, site_id)
);

ALTER TABLE public.passion_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Passion points are publicly readable" ON public.passion_points FOR SELECT USING (true);
CREATE POLICY "Users can manage own passion points" ON public.passion_points FOR INSERT WITH CHECK (
  user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
);
CREATE POLICY "Users can update own passion points" ON public.passion_points FOR UPDATE USING (
  user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
);

-- Relationships table (fan connections)
CREATE TABLE public.relationships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL DEFAULT 'fan' CHECK (relationship_type IN ('fan', 'follow')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (from_user_id, to_user_id, relationship_type)
);

ALTER TABLE public.relationships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Relationships are publicly readable" ON public.relationships FOR SELECT USING (true);
CREATE POLICY "Users can create relationships" ON public.relationships FOR INSERT WITH CHECK (
  from_user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
);
CREATE POLICY "Users can delete own relationships" ON public.relationships FOR DELETE USING (
  from_user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
);

-- Indexes for performance
CREATE INDEX idx_users_username ON public.users(username);
CREATE INDEX idx_social_links_user_id ON public.social_links(user_id);
CREATE INDEX idx_fan_clubs_owner_id ON public.fan_clubs(owner_id);
CREATE INDEX idx_brand_collabs_user_id ON public.brand_collabs(user_id);
CREATE INDEX idx_passion_points_user_id ON public.passion_points(user_id);
CREATE INDEX idx_relationships_to_user ON public.relationships(to_user_id, relationship_type);

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_passion_points_updated_at BEFORE UPDATE ON public.passion_points FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
