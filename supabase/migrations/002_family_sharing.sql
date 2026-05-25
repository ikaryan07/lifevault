-- HomePin: Family sharing (shared passwords & household for all members)

-- Families (one shared household vault)
CREATE TABLE IF NOT EXISTS public.families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'My Family',
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  invite_code TEXT UNIQUE NOT NULL DEFAULT lower(substring(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'removed')),
  display_name TEXT,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(family_id, user_id)
);

-- Shared Family Hub: passwords (encrypted at application layer)
CREATE TABLE IF NOT EXISTS public.shared_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'other',
  username TEXT DEFAULT '',
  password_ciphertext TEXT,
  password_iv TEXT,
  url TEXT DEFAULT '',
  pin_ciphertext TEXT,
  pin_iv TEXT,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shared Family Hub: household info (encrypted values)
CREATE TABLE IF NOT EXISTS public.household_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  label TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'other',
  value_ciphertext TEXT,
  value_iv TEXT,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_items ENABLE ROW LEVEL SECURITY;

-- Returns family IDs the current user belongs to
CREATE OR REPLACE FUNCTION public.user_family_ids()
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT family_id
  FROM public.family_members
  WHERE user_id = auth.uid() AND status = 'active';
$$;

-- Families: members can view their family
CREATE POLICY "Members can view family" ON public.families
  FOR SELECT USING (id IN (SELECT public.user_family_ids()));

CREATE POLICY "Owner can update family" ON public.families
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Owner can delete empty family" ON public.families
  FOR DELETE USING (owner_id = auth.uid());

-- Family members
CREATE POLICY "Members can view family members" ON public.family_members
  FOR SELECT USING (family_id IN (SELECT public.user_family_ids()));

CREATE POLICY "Users can insert own membership" ON public.family_members
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Owner can manage members" ON public.family_members
  FOR UPDATE USING (
    family_id IN (
      SELECT id FROM public.families WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Owner can remove members" ON public.family_members
  FOR DELETE USING (
    family_id IN (
      SELECT id FROM public.families WHERE owner_id = auth.uid()
    )
    AND user_id <> auth.uid()
  );

-- Shared credentials: all active family members share read/write
CREATE POLICY "Family can view credentials" ON public.shared_credentials
  FOR SELECT USING (family_id IN (SELECT public.user_family_ids()));

CREATE POLICY "Family can add credentials" ON public.shared_credentials
  FOR INSERT WITH CHECK (
    family_id IN (SELECT public.user_family_ids())
    AND created_by = auth.uid()
  );

CREATE POLICY "Family can update credentials" ON public.shared_credentials
  FOR UPDATE USING (family_id IN (SELECT public.user_family_ids()));

CREATE POLICY "Family can delete credentials" ON public.shared_credentials
  FOR DELETE USING (family_id IN (SELECT public.user_family_ids()));

-- Household items: same as credentials
CREATE POLICY "Family can view household" ON public.household_items
  FOR SELECT USING (family_id IN (SELECT public.user_family_ids()));

CREATE POLICY "Family can add household" ON public.household_items
  FOR INSERT WITH CHECK (
    family_id IN (SELECT public.user_family_ids())
    AND created_by = auth.uid()
  );

CREATE POLICY "Family can update household" ON public.household_items
  FOR UPDATE USING (family_id IN (SELECT public.user_family_ids()));

CREATE POLICY "Family can delete household" ON public.household_items
  FOR DELETE USING (family_id IN (SELECT public.user_family_ids()));

CREATE INDEX idx_family_members_user ON public.family_members(user_id);
CREATE INDEX idx_family_members_family ON public.family_members(family_id);
CREATE INDEX idx_shared_credentials_family ON public.shared_credentials(family_id);
CREATE INDEX idx_household_items_family ON public.household_items(family_id);
CREATE INDEX idx_families_invite_code ON public.families(invite_code);

-- Auto-create family when profile is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  new_family_id UUID;
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.email
  );

  INSERT INTO public.families (name, owner_id)
  VALUES (
    COALESCE(
      NULLIF(trim(COALESCE(NEW.raw_user_meta_data->>'first_name', '')), '') || '''s Family',
      'My Family'
    ),
    NEW.id
  )
  RETURNING id INTO new_family_id;

  INSERT INTO public.family_members (family_id, user_id, role, status, display_name)
  VALUES (
    new_family_id,
    NEW.id,
    'owner',
    'active',
    trim(COALESCE(NEW.raw_user_meta_data->>'first_name', '') || ' ' || COALESCE(NEW.raw_user_meta_data->>'last_name', ''))
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_shared_credentials_updated_at
  BEFORE UPDATE ON public.shared_credentials
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_household_items_updated_at
  BEFORE UPDATE ON public.household_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
