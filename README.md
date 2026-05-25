# HomePin

Australian family password sharing and legacy planning app.

**Live:** [homepin.vercel.app](https://homepin.vercel.app)

## What it does

- **Family Hub** — shared passwords, household info, and family invites (cloud-synced via Supabase)
- **Legacy Vault** — personal documents, trusted contacts, checklists, and messages
- **Family billing** — one owner pays; invited members join free and share Family Hub data

## Plans

| Plan | Monthly | Annual | Who pays |
|------|---------|--------|----------|
| Free | $0 | — | — |
| Family | $6.99/mo | $69/yr (save 2 months) | Family owner |
| Legacy | $12.99/mo | $129/yr (save 2 months) | Family owner |

See [SETUP.md](./SETUP.md) for full deployment instructions.

## Quick start (local)

```bash
npm install
cp .env.local.example .env.local
# Fill in Supabase URL, anon key, ENCRYPTION_SECRET
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Database migrations

Run in Supabase SQL Editor, in order:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/run_002_family_only.sql` (or `002_family_sharing.sql`)
3. `supabase/migrations/003_invite_code_lookup.sql`
4. `supabase/migrations/004_subscriptions.sql`

## Stripe (when ready)

1. Create Family and Legacy products/prices in Stripe Dashboard
2. Add env vars: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_FAMILY`, `STRIPE_PRICE_LEGACY`
3. Point webhook to `https://your-domain/api/stripe/webhook`
4. Add `SUPABASE_SERVICE_ROLE_KEY` for webhook plan updates

Without Stripe, family owners can start **14-day free trials** from Settings → Family plan.

## Tech stack

Next.js 16 · React 19 · TypeScript · Tailwind · Supabase · Stripe (optional)
