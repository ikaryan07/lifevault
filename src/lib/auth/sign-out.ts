"use client";

import { signOut as serverSignOut } from "@/lib/auth/actions";

/**
 * Sign out from the app. In demo mode (no Supabase configured), this also
 * clears any HomePin data persisted in localStorage so a shared machine
 * doesn't leak data between users.
 */
const PRESERVE_KEYS = new Set(["HomePin:welcome-complete", "HomePin:theme", "HomePin:accessibility"]);

export async function signOutClient() {
  if (typeof window !== "undefined") {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("HomePin") && !PRESERVE_KEYS.has(key)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  }
  await serverSignOut();
}
