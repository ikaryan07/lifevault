import type { User } from "@supabase/supabase-js";
import { storageKeys } from "@/lib/storage-keys";
import type { UserProfile } from "@/lib/store";

export function profileFromSupabaseUser(user: User, existing?: UserProfile | null): UserProfile {
  const meta = user.user_metadata ?? {};
  return {
    firstName: (meta.first_name as string) || (meta.firstName as string) || existing?.firstName || "",
    lastName: (meta.last_name as string) || (meta.lastName as string) || existing?.lastName || "",
    email: user.email || existing?.email || "",
    createdAt: existing?.createdAt || user.created_at || new Date().toISOString(),
  };
}

export function syncSupabaseProfileToStorage(user: User, existing?: UserProfile | null): UserProfile {
  const profile = profileFromSupabaseUser(user, existing);
  if (typeof window !== "undefined") {
    localStorage.setItem(storageKeys.profile, JSON.stringify(profile));
    localStorage.removeItem(storageKeys.demoSession);
  }
  return profile;
}
