/** Canonical site URL for auth email links and invite links (no trailing slash). */
export function getSiteUrl(): string {
  // In the browser, prefer the live origin (fixes mobile + avoids stale build-time env)
  if (typeof window !== "undefined") {
    const origin = window.location.origin.replace(/\/$/, "");
    if (!origin.includes("localhost") && !origin.includes("127.0.0.1")) {
      return origin;
    }
  }

  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv && !fromEnv.includes("localhost")) {
    return fromEnv.replace(/\/$/, "");
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }

  if (typeof window !== "undefined") {
    return window.location.origin.replace(/\/$/, "");
  }

  return "http://localhost:3000";
}

/** Server-safe site URL for metadata and emails (no window). */
export function getServerSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }
  return "https://homepin.vercel.app";
}

export function authCallbackUrl(next?: string): string {
  const base = `${getSiteUrl()}/auth/callback`;
  if (next && next.startsWith("/")) {
    return `${base}?next=${encodeURIComponent(next)}`;
  }
  return base;
}

export function joinFamilyUrl(inviteCode: string): string {
  const code = inviteCode.trim().toLowerCase();
  return `${getSiteUrl()}/join-family?code=${encodeURIComponent(code)}`;
}

export function loginUrl(next?: string): string {
  const base = `${getSiteUrl()}/login`;
  if (next && next.startsWith("/")) {
    return `${base}?force=1&next=${encodeURIComponent(next)}`;
  }
  return `${base}?force=1`;
}
