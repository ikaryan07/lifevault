"use client";

import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/auth/demo";
import { syncSupabaseProfileToStorage } from "@/lib/auth/sync-profile";
import { friendlyAuthError } from "@/lib/auth/errors";
import {
  clearUserVaultData,
  migrateLegacyStorageKeys,
  storageKeys,
} from "@/lib/storage-keys";
import { authCallbackUrl } from "@/lib/auth/site-url";
import type { UserProfile } from "@/lib/store";

export async function signInClient(email: string, password: string) {
  if (!isSupabaseConfigured()) {
    return { success: "demo" as const };
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    return { error: friendlyAuthError(error.message) };
  }

  if (data.user) {
    syncSupabaseProfileToStorage(data.user);
    localStorage.setItem(storageKeys.welcomeComplete, "true");
  }

  return { success: true as const, user: data.user };
}

export async function signUpClient(
  firstName: string,
  lastName: string,
  email: string,
  password: string
) {
  if (!isSupabaseConfigured()) {
    return { success: "demo" as const, firstName, lastName, email };
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: { first_name: firstName.trim(), last_name: lastName.trim() },
      emailRedirectTo: authCallbackUrl("/dashboard/welcome"),
    },
  });

  if (error) {
    return { error: friendlyAuthError(error.message) };
  }

  if (data.session?.user) {
    syncSupabaseProfileToStorage(data.session.user);
    localStorage.setItem(storageKeys.welcomeComplete, "true");
    return { success: true as const, hasSession: true as const };
  }

  if (data.user && !data.session) {
    return { success: "verify_email" as const };
  }

  return { success: "verify_email" as const };
}

export async function signOutClient() {
  if (isSupabaseConfigured()) {
    const supabase = createClient();
    await supabase.auth.signOut();
  }

  clearUserVaultData();
  window.location.href = "/login";
}

export async function resetPasswordClient(email: string) {
  if (!isSupabaseConfigured()) {
    return { success: "Demo mode — no email sent." };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: authCallbackUrl("/dashboard/settings"),
  });

  if (error) {
    return { error: friendlyAuthError(error.message) };
  }

  return { success: "Check your email for a password reset link." };
}

export async function resendVerificationEmail(email: string) {
  if (!isSupabaseConfigured()) {
    return { error: "Cloud sign-in is not configured." };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: email.trim(),
    options: {
      emailRedirectTo: authCallbackUrl("/dashboard/welcome"),
    },
  });

  if (error) {
    return { error: friendlyAuthError(error.message) };
  }

  return { success: true as const };
}

export function completeDemoSignIn(email: string) {
  migrateLegacyStorageKeys();

  let profile: UserProfile | null = null;
  try {
    const existing = localStorage.getItem(storageKeys.profile);
    if (existing) profile = JSON.parse(existing) as UserProfile;
  } catch {
    profile = null;
  }

  localStorage.setItem(
    storageKeys.profile,
    JSON.stringify({
      firstName: profile?.firstName ?? "",
      lastName: profile?.lastName ?? "",
      email: email || profile?.email || "",
      createdAt: profile?.createdAt ?? new Date().toISOString(),
    })
  );
  localStorage.setItem(storageKeys.welcomeComplete, "true");
  localStorage.setItem(storageKeys.demoSession, "true");
}

export function completeDemoSignUp(
  firstName: string,
  lastName: string,
  email: string
) {
  localStorage.setItem(
    storageKeys.profile,
    JSON.stringify({
      firstName,
      lastName,
      email,
      createdAt: new Date().toISOString(),
    })
  );
  localStorage.setItem(storageKeys.demoSession, "true");
}

/** Clears stale auth when switching from demo to cloud mode. */
export async function prepareFreshLogin() {
  if (!isSupabaseConfigured()) return;
  clearUserVaultData();
  const supabase = createClient();
  await supabase.auth.signOut();
}
