"use server";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/auth/demo";
import { friendlyAuthError } from "@/lib/auth/errors";

/** Server-side password update (user must already be logged in). */
export async function updatePassword(formData: FormData) {
  if (!isSupabaseConfigured()) {
    return { success: "Password updated (demo mode)." };
  }

  const supabase = await createClient();
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: friendlyAuthError(error.message) };
  }

  return { success: "Password updated successfully." };
}
