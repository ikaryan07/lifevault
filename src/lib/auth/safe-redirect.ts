/** Allow only same-origin relative paths (blocks open redirects like //evil.com). */
export function safeRedirectPath(next: string | null | undefined): string | null {
  if (!next) return null;
  const trimmed = next.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return null;
  if (trimmed.includes("\\") || trimmed.includes("@")) return null;

  try {
    const url = new URL(trimmed, "https://homepin.local");
    if (url.origin !== "https://homepin.local") return null;
    const path = `${url.pathname}${url.search}${url.hash}`;
    if (!path.startsWith("/") || path.startsWith("//")) return null;
    return path;
  } catch {
    return null;
  }
}

export function loginPathWithNext(next: string | null | undefined): string {
  const safe = safeRedirectPath(next);
  if (!safe) return "/login?force=1";
  return `/login?force=1&next=${encodeURIComponent(safe)}`;
}

export function signupPathWithJoin(joinCode: string | null | undefined): string {
  const normalized = joinCode?.trim().toLowerCase().replace(/[^a-z0-9]/g, "") ?? "";
  if (!normalized) return "/signup";
  return `/signup?join=${encodeURIComponent(normalized)}`;
}

/** Read pending post-auth path saved during signup (e.g. join-family invite). */
export function getPendingAuthNext(): string | null {
  if (typeof window === "undefined") return null;
  return safeRedirectPath(sessionStorage.getItem("homepin:pending-next"));
}

export function setPendingAuthNext(next: string | null | undefined) {
  if (typeof window === "undefined") return;
  const safe = safeRedirectPath(next);
  if (safe) {
    sessionStorage.setItem("homepin:pending-next", safe);
  } else {
    sessionStorage.removeItem("homepin:pending-next");
  }
}

export function clearPendingAuthNext() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem("homepin:pending-next");
}
