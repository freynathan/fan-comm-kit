-- ============================================
-- 1. ADD MISSING COLUMNS TO fan_clubs
-- ============================================
ALTER TABLE public.fan_clubs
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'public',
  ADD COLUMN IF NOT EXISTS fan_trust_score INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS welcome_message TEXT,
  ADD COLUMN IF NOT EXISTS benefits TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS price_monthly NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tagline TEXT,
  ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
  ADD COLUMN IF NOT EXISTS site_slug TEXT,
  ADD COLUMN IF NOT EXISTS post_count INTEGER NOT NULL DEFAULT 0;

-- visibility constraint
ALTER TABLE public.fan_clubs
  DROP CONSTRAINT IF EXISTS fan_clubs_visibility_check;
ALTER TABLE public.fan_clubs
  ADD CONSTRAINT fan_clubs_visibility_check
  CHECK (visibility IN ('public', 'unlisted', 'private'));

-- unique slug per owner
CREATE UNIQUE INDEX IF NOT EXISTS fan_clubs_owner_slug_unique
  ON public.fan_clubs(owner_id, slug)
  WHERE slug IS NOT NULL;

-- ============================================
-- 2. fan_club_memberships
-- ============================================
CREATE TABLE IF NOT EXISTS public.fan_club_memberships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id UUID NOT NULL REFERENCES public.fan_clubs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(club_id, user_id),
  CONSTRAINT fan_club_memberships_status_check
    CHECK (status IN ('active', 'cancelled', 'pending'))
);

CREATE INDEX IF NOT EXISTS idx_fan_club_memberships_club ON public.fan_club_memberships(club_id);
CREATE INDEX IF NOT EXISTS idx_fan_club_memberships_user ON public.fan_club_memberships(user_id);

ALTER TABLE public.fan_club_memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Memberships are publicly readable"
  ON public.fan_club_memberships FOR SELECT USING (true);

CREATE POLICY "Users can join clubs as themselves"
  ON public.fan_club_memberships FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can leave their own memberships"
  ON public.fan_club_memberships FOR DELETE
  USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "Owners or members can update membership"
  ON public.fan_club_memberships FOR UPDATE
  USING (
    user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
    OR club_id IN (
      SELECT id FROM public.fan_clubs
      WHERE owner_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
    )
  );

-- ============================================
-- 3. fan_trust_events
-- ============================================
CREATE TABLE IF NOT EXISTS public.fan_trust_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id UUID NOT NULL REFERENCES public.fan_clubs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  points_awarded INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fan_trust_events_club ON public.fan_trust_events(club_id);
CREATE INDEX IF NOT EXISTS idx_fan_trust_events_user ON public.fan_trust_events(user_id);

ALTER TABLE public.fan_trust_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trust events are publicly readable"
  ON public.fan_trust_events FOR SELECT USING (true);

CREATE POLICY "Authenticated users can record trust events for themselves"
  ON public.fan_trust_events FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

-- ============================================
-- 4. fan_club_invitations
-- ============================================
CREATE TABLE IF NOT EXISTS public.fan_club_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id UUID NOT NULL REFERENCES public.fan_clubs(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  email TEXT,
  invited_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  used_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fan_club_invitations_club ON public.fan_club_invitations(club_id);
CREATE INDEX IF NOT EXISTS idx_fan_club_invitations_code ON public.fan_club_invitations(code);

ALTER TABLE public.fan_club_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Club owners can view their invitations"
  ON public.fan_club_invitations FOR SELECT
  USING (
    club_id IN (
      SELECT id FROM public.fan_clubs
      WHERE owner_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
    )
  );

CREATE POLICY "Club owners can create invitations"
  ON public.fan_club_invitations FOR INSERT
  WITH CHECK (
    club_id IN (
      SELECT id FROM public.fan_clubs
      WHERE owner_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
    )
  );

CREATE POLICY "Club owners can update invitations"
  ON public.fan_club_invitations FOR UPDATE
  USING (
    club_id IN (
      SELECT id FROM public.fan_clubs
      WHERE owner_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
    )
  );

CREATE POLICY "Club owners can delete invitations"
  ON public.fan_club_invitations FOR DELETE
  USING (
    club_id IN (
      SELECT id FROM public.fan_clubs
      WHERE owner_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
    )
  );

-- ============================================
-- 5. Fan trust score trigger
-- ============================================
CREATE OR REPLACE FUNCTION public.update_fan_trust_score()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.fan_clubs
  SET fan_trust_score = COALESCE((
    SELECT SUM(points_awarded)
    FROM public.fan_trust_events
    WHERE club_id = NEW.club_id
  ), 0)
  WHERE id = NEW.club_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS fan_trust_score_trigger ON public.fan_trust_events;
CREATE TRIGGER fan_trust_score_trigger
AFTER INSERT ON public.fan_trust_events
FOR EACH ROW
EXECUTE FUNCTION public.update_fan_trust_score();