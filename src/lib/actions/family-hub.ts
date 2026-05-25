"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/auth/demo";
import { encryptSecret, decryptSecret, hasEncryptionSecret } from "@/lib/crypto/server-secrets";
import { assertCanAddFamilyMember, assertWithinLimit } from "@/lib/subscriptions/server";
import type { SharedCredential, HouseholdItem, CredentialCategory, HouseholdCategory } from "@/lib/store";
import { revalidatePath } from "next/cache";

function generateInviteCode(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 8).toLowerCase();
}

function normalizeInviteCode(code: string): string {
  return code.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

async function lookupFamilyByInviteCode(
  normalized: string
): Promise<{ id: string; name: string } | null> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("find_family_by_invite_code", {
    invite: normalized,
  });

  if (!error && data) {
    const row = Array.isArray(data) ? data[0] : data;
    if (row?.id) return { id: row.id as string, name: row.name as string };
  }

  if (hasAdminClient()) {
    const admin = createAdminClient();
    const { data: rows } = await admin.from("families").select("id, name, invite_code");
    const match = rows?.find(
      (f) => normalizeInviteCode(String(f.invite_code ?? "")) === normalized
    );
    if (match) return { id: match.id, name: match.name };
  }

  return null;
}

async function ensureInviteCodeOnFamily(
  supabase: Awaited<ReturnType<typeof createClient>>,
  familyId: string,
  currentCode: string | null | undefined
): Promise<string> {
  if (currentCode && normalizeInviteCode(currentCode)) {
    return currentCode.trim().toLowerCase();
  }

  const newCode = generateInviteCode();
  const { error } = await supabase
    .from("families")
    .update({ invite_code: newCode })
    .eq("id", familyId);

  if (error && hasAdminClient()) {
    await createAdminClient().from("families").update({ invite_code: newCode }).eq("id", familyId);
  }

  return newCode;
}

export type FamilyMemberInfo = {
  id: string;
  userId: string;
  role: string;
  displayName: string;
  email: string;
  joinedAt: string;
};

export type FamilyInfo = {
  id: string;
  name: string;
  inviteCode: string;
  role: string;
  members: FamilyMemberInfo[];
};

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Not authenticated");
  return { supabase, user };
}

async function getActiveFamilyId(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data, error } = await supabase
    .from("family_members")
    .select("family_id")
    .eq("user_id", userId)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data?.family_id as string | undefined;
}

/** Creates a family for users who signed up before family sharing existed. */
async function ensureFamily(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const existing = await getActiveFamilyId(supabase, userId);
  if (existing) return existing;

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, email")
    .eq("id", userId)
    .maybeSingle();

  const familyName = profile?.first_name
    ? `${profile.first_name}'s Family`
    : "My Family";

  const { data: family, error: famErr } = await supabase
    .from("families")
    .insert({ name: familyName, owner_id: userId, invite_code: generateInviteCode() })
    .select("id")
    .single();

  if (famErr || !family) throw new Error(famErr?.message ?? "Could not create family");

  await supabase.from("family_members").insert({
    family_id: family.id,
    user_id: userId,
    role: "owner",
    status: "active",
    display_name: [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || undefined,
  });

  return family.id as string;
}

function encryptScope(familyId: string) {
  return `family:${familyId}`;
}

export async function getFamilyInfo(): Promise<{ family: FamilyInfo | null; cloudEnabled: boolean }> {
  if (!isSupabaseConfigured()) {
    return { family: null, cloudEnabled: false };
  }

  const { supabase, user } = await requireUser();
  const familyId = await ensureFamily(supabase, user.id);

  const { data: family, error: famErr } = await supabase
    .from("families")
    .select("id, name, invite_code, owner_id")
    .eq("id", familyId)
    .single();

  if (famErr || !family) return { family: null, cloudEnabled: true };

  const inviteCode = await ensureInviteCodeOnFamily(supabase, family.id, family.invite_code);

  const { data: members, error: memErr } = await supabase
    .from("family_members")
    .select("id, user_id, role, display_name, joined_at")
    .eq("family_id", familyId)
    .eq("status", "active");

  if (memErr) throw new Error(memErr.message);

  const userIds = (members ?? []).map((m) => m.user_id);
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, first_name, last_name")
    .in("id", userIds);

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
  const myMembership = members?.find((m) => m.user_id === user.id);

  const memberList: FamilyMemberInfo[] = (members ?? []).map((m) => {
    const p = profileMap.get(m.user_id);
    const name =
      m.display_name?.trim() ||
      [p?.first_name, p?.last_name].filter(Boolean).join(" ").trim() ||
      p?.email ||
      "Family member";
    return {
      id: m.id,
      userId: m.user_id,
      role: m.role,
      displayName: name,
      email: p?.email ?? "",
      joinedAt: m.joined_at,
    };
  });

  return {
    cloudEnabled: true,
    family: {
      id: family.id,
      name: family.name,
      inviteCode,
      role: myMembership?.role ?? "member",
      members: memberList,
    },
  };
}

export async function updateFamilyName(name: string) {
  if (!isSupabaseConfigured()) return { error: "Cloud not configured" };
  const { supabase, user } = await requireUser();
  const familyId = await getActiveFamilyId(supabase, user.id);
  if (!familyId) return { error: "No family found" };

  const { error } = await supabase
    .from("families")
    .update({ name: name.trim() })
    .eq("id", familyId)
    .eq("owner_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/family/members");
  return { success: true };
}

export async function joinFamilyByInviteCode(code: string) {
  if (!isSupabaseConfigured()) return { error: "Cloud not configured" };
  const { supabase, user } = await requireUser();
  const normalized = normalizeInviteCode(code);

  if (!normalized) return { error: "Enter a valid invite code" };

  try {
    const { error: leaveErr } = await supabase.rpc("leave_solo_family_if_empty");
    if (leaveErr) {
      return { error: leaveErr.message };
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Cannot join family" };
  }

  const family = await lookupFamilyByInviteCode(normalized);

  if (!family) return { error: "Invalid invite code — check it and try again" };

  const existingFamilyId = await getActiveFamilyId(supabase, user.id);
  if (existingFamilyId === family.id) {
    revalidatePath("/dashboard");
    return { success: true, familyName: family.name };
  }

  if (existingFamilyId) {
    return {
      error:
        "You are already in a family vault. Each account can only belong to one family for now.",
    };
  }

  const memberCheck = await assertCanAddFamilyMember(family.id);
  if (memberCheck.error) return memberCheck;

  const meta = user.user_metadata as { first_name?: string; last_name?: string };
  const displayName = [meta?.first_name, meta?.last_name].filter(Boolean).join(" ").trim();

  const { error: joinErr } = await supabase.from("family_members").insert({
    family_id: family.id,
    user_id: user.id,
    role: "member",
    status: "active",
    display_name: displayName || user.email?.split("@")[0] || "Member",
  });

  if (joinErr) {
    if (joinErr.code === "23505") {
      revalidatePath("/dashboard");
      return { success: true, familyName: family.name };
    }
    return { error: joinErr.message };
  }

  revalidatePath("/dashboard");
  return { success: true, familyName: family.name };
}

export async function fetchFamilyHubData(): Promise<{
  credentials: SharedCredential[];
  household: HouseholdItem[];
  cloudEnabled: boolean;
} | null> {
  if (!isSupabaseConfigured()) return null;

  const { supabase, user } = await requireUser();
  const familyId = await ensureFamily(supabase, user.id);

  const scope = encryptScope(familyId);
  const canDecrypt = hasEncryptionSecret();

  const [credRes, houseRes] = await Promise.all([
    supabase.from("shared_credentials").select("*").eq("family_id", familyId).order("created_at"),
    supabase.from("household_items").select("*").eq("family_id", familyId).order("created_at"),
  ]);

  if (credRes.error) throw new Error(credRes.error.message);
  if (houseRes.error) throw new Error(houseRes.error.message);

  const credentials: SharedCredential[] = (credRes.data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    category: row.category as CredentialCategory,
    username: row.username ?? "",
    password:
      canDecrypt && row.password_ciphertext
        ? decryptSecret(row.password_ciphertext, row.password_iv ?? "", scope)
        : "",
    url: row.url ?? "",
    pin:
      canDecrypt && row.pin_ciphertext
        ? decryptSecret(row.pin_ciphertext, row.pin_iv ?? "", scope)
        : "",
    notes: row.notes ?? "",
    updatedAt: row.updated_at ?? row.created_at,
  }));

  const household: HouseholdItem[] = (houseRes.data ?? []).map((row) => ({
    id: row.id,
    label: row.label,
    category: row.category as HouseholdCategory,
    value:
      canDecrypt && row.value_ciphertext
        ? decryptSecret(row.value_ciphertext, row.value_iv ?? "", scope)
        : "",
    notes: row.notes ?? "",
    updatedAt: row.updated_at ?? row.created_at,
  }));

  return { credentials, household, cloudEnabled: true };
}

export async function saveCredential(credential: SharedCredential, isNew: boolean) {
  if (!isSupabaseConfigured()) return { error: "Cloud not configured" };
  if (!hasEncryptionSecret()) return { error: "Server encryption not configured" };

  const { supabase, user } = await requireUser();
  const familyId = await ensureFamily(supabase, user.id);

  if (isNew) {
    const { count } = await supabase
      .from("shared_credentials")
      .select("id", { count: "exact", head: true })
      .eq("family_id", familyId);
    const limitCheck = await assertWithinLimit(user.id, "passwords", count ?? 0);
    if (limitCheck.error) return limitCheck;
  }

  const scope = encryptScope(familyId);
  const encPassword = encryptSecret(credential.password ?? "", scope);
  const encPin = encryptSecret(credential.pin ?? "", scope);

  const row = {
    family_id: familyId,
    created_by: user.id,
    name: credential.name,
    category: credential.category,
    username: credential.username,
    password_ciphertext: encPassword.ciphertext,
    password_iv: encPassword.iv,
    url: credential.url,
    pin_ciphertext: encPin.ciphertext,
    pin_iv: encPin.iv,
    notes: credential.notes,
  };

  if (isNew) {
    const { data, error } = await supabase
      .from("shared_credentials")
      .insert(row)
      .select("id, updated_at")
      .single();
    if (error) return { error: error.message };
    return { id: data.id, updatedAt: data.updated_at };
  }

  const { error } = await supabase
    .from("shared_credentials")
    .update(row)
    .eq("id", credential.id)
    .eq("family_id", familyId);

  if (error) return { error: error.message };
  return { id: credential.id, updatedAt: new Date().toISOString() };
}

export async function deleteCredential(id: string) {
  if (!isSupabaseConfigured()) return { error: "Cloud not configured" };
  const { supabase, user } = await requireUser();
  const familyId = await ensureFamily(supabase, user.id);

  const { error } = await supabase
    .from("shared_credentials")
    .delete()
    .eq("id", id)
    .eq("family_id", familyId);

  if (error) return { error: error.message };
  return { success: true };
}

export async function saveHouseholdItem(item: HouseholdItem, isNew: boolean) {
  if (!isSupabaseConfigured()) return { error: "Cloud not configured" };
  if (!hasEncryptionSecret()) return { error: "Server encryption not configured" };

  const { supabase, user } = await requireUser();
  const familyId = await ensureFamily(supabase, user.id);

  if (isNew) {
    const { count } = await supabase
      .from("household_items")
      .select("id", { count: "exact", head: true })
      .eq("family_id", familyId);
    const limitCheck = await assertWithinLimit(user.id, "household", count ?? 0);
    if (limitCheck.error) return limitCheck;
  }

  const scope = encryptScope(familyId);
  const encValue = encryptSecret(item.value, scope);

  const row = {
    family_id: familyId,
    created_by: user.id,
    label: item.label,
    category: item.category,
    value_ciphertext: encValue.ciphertext,
    value_iv: encValue.iv,
    notes: item.notes,
  };

  if (isNew) {
    const { data, error } = await supabase
      .from("household_items")
      .insert(row)
      .select("id, updated_at")
      .single();
    if (error) return { error: error.message };
    return { id: data.id, updatedAt: data.updated_at };
  }

  const { error } = await supabase
    .from("household_items")
    .update(row)
    .eq("id", item.id)
    .eq("family_id", familyId);

  if (error) return { error: error.message };
  return { id: item.id, updatedAt: new Date().toISOString() };
}

export async function deleteHouseholdItem(id: string) {
  if (!isSupabaseConfigured()) return { error: "Cloud not configured" };
  const { supabase, user } = await requireUser();
  const familyId = await ensureFamily(supabase, user.id);

  const { error } = await supabase
    .from("household_items")
    .delete()
    .eq("id", id)
    .eq("family_id", familyId);

  if (error) return { error: error.message };
  return { success: true };
}
