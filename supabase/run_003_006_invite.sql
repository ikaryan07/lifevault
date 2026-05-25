-- Run after 001 + 002 (and 004 if using subscriptions).
-- Combines invite RPCs from migrations 003 and 006.

CREATE OR REPLACE FUNCTION public.find_family_by_invite_code(invite text)
RETURNS TABLE (id uuid, name text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT f.id, f.name
  FROM public.families f
  WHERE lower(regexp_replace(trim(f.invite_code), '[^a-z0-9]', '', 'g'))
      = lower(regexp_replace(trim(invite), '[^a-z0-9]', '', 'g'))
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.find_family_by_invite_code(text) TO authenticated;

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

UPDATE public.families
SET invite_code = lower(substring(replace(gen_random_uuid()::text, '-', ''), 1, 8))
WHERE invite_code IS NULL OR trim(invite_code) = '';

CREATE OR REPLACE FUNCTION public.get_family_join_meta(target_family_id uuid)
RETURNS TABLE (
  id uuid,
  plan_id text,
  trial_ends_at timestamptz,
  subscription_status text,
  stripe_customer_id text,
  stripe_subscription_id text,
  member_count bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    f.id,
    COALESCE(f.plan_id, 'free'),
    f.trial_ends_at,
    COALESCE(f.subscription_status, 'none'),
    f.stripe_customer_id,
    f.stripe_subscription_id,
    (
      SELECT count(*)::bigint
      FROM public.family_members fm
      WHERE fm.family_id = f.id AND fm.status = 'active'
    )
  FROM public.families f
  WHERE f.id = target_family_id
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_family_join_meta(uuid) TO authenticated;
