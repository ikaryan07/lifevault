-- Family-level subscriptions (one payer per household)

ALTER TABLE public.families
  ADD COLUMN IF NOT EXISTS plan_id TEXT NOT NULL DEFAULT 'free'
    CHECK (plan_id IN ('free', 'family', 'legacy'));

ALTER TABLE public.families
  ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;

ALTER TABLE public.families
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

ALTER TABLE public.families
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

ALTER TABLE public.families
  ADD COLUMN IF NOT EXISTS subscription_status TEXT NOT NULL DEFAULT 'none'
    CHECK (subscription_status IN ('none', 'trialing', 'active', 'past_due', 'canceled'));

-- Document encryption key stored encrypted-at-rest in app layer (client-side key export)
ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS encryption_key TEXT;

CREATE INDEX IF NOT EXISTS idx_families_stripe_customer ON public.families(stripe_customer_id);
