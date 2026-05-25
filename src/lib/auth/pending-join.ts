import { joinFamilyPath, normalizeInviteCode } from "@/lib/auth/site-url";
import { safeRedirectPath } from "@/lib/auth/safe-redirect";

const PENDING_JOIN_KEY = "homepin:pending-join";

export function setPendingJoinCode(code: string | null | undefined) {
  if (typeof window === "undefined") return;
  const normalized = code ? normalizeInviteCode(code) : "";
  if (normalized) {
    sessionStorage.setItem(PENDING_JOIN_KEY, normalized);
    sessionStorage.setItem("homepin:pending-next", joinFamilyPath(normalized));
  } else {
    sessionStorage.removeItem(PENDING_JOIN_KEY);
  }
}

export function getPendingJoinCode(): string | null {
  if (typeof window === "undefined") return null;
  const fromJoin = sessionStorage.getItem(PENDING_JOIN_KEY);
  if (fromJoin) return normalizeInviteCode(fromJoin) || null;

  const next = safeRedirectPath(sessionStorage.getItem("homepin:pending-next"));
  const match = next?.match(/^\/join-family\/([a-z0-9]+)$/i);
  return match?.[1] ?? null;
}

export function pendingJoinRedirectPath(): string | null {
  const code = getPendingJoinCode();
  return code ? joinFamilyPath(code) : safeRedirectPath(sessionStorage.getItem("homepin:pending-next"));
}

export function clearPendingJoin() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(PENDING_JOIN_KEY);
  sessionStorage.removeItem("homepin:pending-next");
}
