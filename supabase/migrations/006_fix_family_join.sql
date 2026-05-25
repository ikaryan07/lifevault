-- Fix family invite join: lookup + join validation for non-members

-- Backfill missing invite codes
UPDATE public.families
SET invite_code = lower(substring(replace(gen_random_uuid()::text, '-', ''), 1, 8))
WHERE invite_code IS NULL OR trim(invite_code) = '';

-- Improved invite lookup (handles spacing / casing)
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

-- Lets joiners validate plan limits before insert (RLS blocks non-members reading families)
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
