"use server";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/auth/demo";

/** Record a login check-in (updates last_check_in on profile). */
export async function recordLoginCheckIn(): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const now = new Date().toISOString();

  await supabase.from("check_ins").insert({
    user_id: user.id,
    method: "login",
  });

  await supabase.from("profiles").update({ last_check_in: now }).eq("id", user.id);
}
