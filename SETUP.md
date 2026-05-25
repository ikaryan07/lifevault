# HomePin — Production setup guide

Follow these steps to make HomePin safe for real users with **family sharing** (everyone sees the same passwords and household info).

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a project (choose **Sydney** region for Australian data).
2. In **Project Settings → API**, copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → keep secret, only for admin tasks if needed

## 2. Run database migrations

In the Supabase SQL Editor, **copy and paste the full SQL contents** (not file paths) and run:

1. `supabase/setup_all.sql` — full setup in one go, **or**
2. Run `supabase/migrations/001_initial_schema.sql` then `supabase/run_002_family_only.sql`

If you already ran step 1 and get "policy already exists" errors, run only `supabase/run_002_family_only.sql`.

## 3. Configure authentication

In Supabase **Authentication → URL configuration**:

- **Site URL**: `http://localhost:3000` (dev) or your production URL (e.g. `https://homepin.vercel.app`)
- **Redirect URLs** — add both:
  - `http://localhost:3000/auth/callback`
  - `https://your-domain.com/auth/callback`

Enable **Email** provider.

**For easier testing:** Authentication → Providers → Email → turn **off** "Confirm email". Users can sign in immediately after signup. If you leave it on, users must click the verification link in their inbox first (the app shows a verify-email page with a resend button).

**For production:** keep email confirmation on and configure custom SMTP if needed.

## 4. Environment variables

Copy `.env.local.example` to `.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Required for encrypting passwords & household values at rest (min 32 chars)
ENCRYPTION_SECRET=generate-a-long-random-string-at-least-32-characters

# Optional
RESEND_API_KEY=
OPENAI_API_KEY=
```

Generate `ENCRYPTION_SECRET`:

```bash
openssl rand -base64 32
```

**Never commit `.env.local` to GitHub.**

## 5. Deploy to Vercel

1. Push code to GitHub.
2. Import project at [vercel.com](https://vercel.com).
3. Add the same environment variables in **Project Settings → Environment Variables**.
4. Set `NEXT_PUBLIC_SITE_URL` to your Vercel URL (e.g. `https://homepin.vercel.app`).

## How family sharing works

1. **Mum signs up** → HomePin creates her account and a **family vault**.
2. She goes to **Family Hub → Family Members** and copies the **invite link**.
3. **Partner/kids** open the link, sign up or log in, and **join the family**.
4. Anyone in the family sees the **same passwords** and **household info** in real time (stored in Supabase, encrypted at rest).

Legacy Vault items (documents, wills, trusted contacts) remain **per account** for now — only Family Hub is shared.

## Security summary

| Feature | Status |
|---------|--------|
| HTTPS (Vercel) | Automatic |
| Auth (Supabase) | Email + password |
| Row Level Security | Family members only see their family's data |
| Password encryption at rest | AES-256-GCM with `ENCRYPTION_SECRET` |
| Demo mode (no Supabase) | Local browser only — not for production |

## Before sharing publicly

- [ ] Supabase + migrations applied
- [ ] `ENCRYPTION_SECRET` set on Vercel
- [ ] Test: mum adds WiFi password, kid logs in on another device and sees it
- [ ] Privacy policy / terms reviewed by a professional if handling real user data
