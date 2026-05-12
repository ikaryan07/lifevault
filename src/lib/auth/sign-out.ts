"use client";

import { signOut as serverSignOut } from "@/lib/auth/actions";

/**
 * Sign out from the app. In demo mode (no Supabase configured), this also
 * clears any LifeVault data persisted in localStorage so a shared machine
 * doesn't leak data between users.
 */
const PRESERVE_KEYS = new Set(["lifevault:welcome-complete", "lifevault:theme", "lifevault:accessibility"]);

export async function signOutClient() {
  if (typeof window !== "undefined") {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("lifevault") && !PRESERVE_KEYS.has(key)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  }
  await serverSignOut();
}
