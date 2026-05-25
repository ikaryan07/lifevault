-- HomePin: run this entire file in Supabase SQL Editor (Run once)
-- Step 1 of 2 is 001, Step 2 is 002 — or run everything below together.

-- ========== 001_initial_schema.sql ==========

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  date_of_birth DATE,
  address TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  check_in_interval_days INTEGER DEFAULT 30,
  last_check_in TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'other',
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL DEFAULT 0,
  file_path TEXT NOT NULL,
  encryption_iv TEXT NOT NULL,
  notes TEXT,
  is_shared BOOLEAN DEFAULT FALSE,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.trusted_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  contact_user_id UUID REFERENCES public.profiles(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  relationship TEXT,
  access_level TEXT NOT NULL DEFAULT 'on_death_only' CHECK (access_level IN ('full_access', 'limited_access', 'on_death_only')),
  invitation_status TEXT NOT NULL DEFAULT 'pending' CHECK (invitation_status IN ('pending', 'accepted', 'declined')),
  invitation_token TEXT UNIQUE,
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.important_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.digital_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  url TEXT,
  username TEXT,
  action TEXT NOT NULL DEFAULT 'close' CHECK (action IN ('close', 'memorialize', 'transfer', 'keep')),
  transfer_to TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.checklist_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  list_type TEXT NOT NULL CHECK (list_type IN ('before', 'after')),
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, item_id, list_type)
);

CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.vault_access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES public.trusted_contacts(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'expired')),
  confirmations_needed INTEGER DEFAULT 2,
  confirmations_received INTEGER DEFAULT 0,
  reason TEXT,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days')
);

CREATE TABLE IF NOT EXISTS public.vault_access_confirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.vault_access_requests(id) ON DELETE CASCADE,
  confirmer_id UUID NOT NULL REFERENCES public.trusted_contacts(id) ON DELETE CASCADE,
  confirmed BOOLEAN NOT NULL,
  confirmed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(request_id, confirmer_id)
);

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('video', 'audio', 'text')),
  file_path TEXT,
  encryption_iv TEXT,
  content TEXT,
  recipient_name TEXT,
  deliver_on TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  method TEXT NOT NULL DEFAULT 'login' CHECK (method IN ('login', 'email_response', 'manual')),
  checked_in_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trusted_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.important_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vault_access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vault_access_confirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own documents" ON public.documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own documents" ON public.documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own documents" ON public.documents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own documents" ON public.documents FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own trusted contacts" ON public.trusted_contacts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own trusted contacts" ON public.trusted_contacts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own trusted contacts" ON public.trusted_contacts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own trusted contacts" ON public.trusted_contacts FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own important contacts" ON public.important_contacts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own important contacts" ON public.important_contacts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own important contacts" ON public.important_contacts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own important contacts" ON public.important_contacts FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own digital assets" ON public.digital_assets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own digital assets" ON public.digital_assets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own digital assets" ON public.digital_assets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own digital assets" ON public.digital_assets FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own checklist" ON public.checklist_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own checklist" ON public.checklist_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own checklist" ON public.checklist_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own checklist" ON public.checklist_progress FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own audit log" ON public.audit_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own audit log" ON public.audit_log FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own messages" ON public.messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own messages" ON public.messages FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own messages" ON public.messages FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own check-ins" ON public.check_ins FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own check-ins" ON public.check_ins FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners can view vault access requests" ON public.vault_access_requests FOR SELECT USING (auth.uid() = vault_owner_id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE INDEX idx_documents_user_id ON public.documents(user_id);
CREATE INDEX idx_documents_category ON public.documents(category);
CREATE INDEX idx_trusted_contacts_user_id ON public.trusted_contacts(user_id);
CREATE INDEX idx_important_contacts_user_id ON public.important_contacts(user_id);
CREATE INDEX idx_digital_assets_user_id ON public.digital_assets(user_id);
CREATE INDEX idx_checklist_progress_user_id ON public.checklist_progress(user_id);
CREATE INDEX idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX idx_audit_log_created_at ON public.audit_log(created_at);
CREATE INDEX idx_check_ins_user_id ON public.check_ins(user_id);
CREATE INDEX idx_vault_access_requests_owner ON public.vault_access_requests(vault_owner_id);

-- ========== 002_family_sharing.sql ==========

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

CREATE POLICY "Members can view family" ON public.families
  FOR SELECT USING (id IN (SELECT public.user_family_ids()));

CREATE POLICY "Owner can update family" ON public.families
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Owner can delete empty family" ON public.families
  FOR DELETE USING (owner_id = auth.uid());

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
