-- Fix: invite code lookup blocked by RLS (only members could read families table)
-- Run this in Supabase SQL Editor after 001 + 002 migrations.

CREATE OR REPLACE FUNCTION public.find_family_by_invite_code(invite text)
RETURNS TABLE (id uuid, name text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT f.id, f.name
  FROM public.families f
  WHERE lower(trim(f.invite_code)) = lower(trim(invite))
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.find_family_by_invite_code(text) TO authenticated;

-- Lets new members leave their auto-created empty family before joining another
CREATE OR REPLACE FUNCTION public.leave_solo_family_if_empty()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  fam_id uuid;
  cred_count int;
  house_count int;
  member_count int;
BEGIN
  SELECT fm.family_id INTO fam_id
  FROM public.family_members fm
  INNER JOIN public.families f ON f.id = fm.family_id
  WHERE fm.user_id = auth.uid()
    AND fm.status = 'active'
    AND f.owner_id = auth.uid()
  LIMIT 1;

  IF fam_id IS NULL THEN
    RETURN;
  END IF;

  SELECT count(*) INTO cred_count FROM public.shared_credentials WHERE family_id = fam_id;
  SELECT count(*) INTO house_count FROM public.household_items WHERE family_id = fam_id;
  SELECT count(*) INTO member_count
  FROM public.family_members
  WHERE family_id = fam_id AND status = 'active';

  IF cred_count > 0 OR house_count > 0 OR member_count > 1 THEN
    RAISE EXCEPTION 'You already have a family vault with data. Ask the owner to invite you, or use Family Members if you are the owner.';
  END IF;

  DELETE FROM public.family_members WHERE family_id = fam_id;
  DELETE FROM public.families WHERE id = fam_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.leave_solo_family_if_empty() TO authenticated;
