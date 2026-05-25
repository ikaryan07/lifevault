"use server";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/auth/demo";
import { revalidatePath } from "next/cache";
import type {
  StoredDocument,
  StoredDigitalAsset,
  StoredChecklistState,
} from "@/lib/store";
import type { TrustedContact, ImportantContact } from "@/types";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Not authenticated");
  return { supabase, user };
}

function mapTrustedContact(row: Record<string, unknown>): TrustedContact {
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    name: row.name as string,
    email: row.email as string,
    phone: (row.phone as string) || undefined,
    relationship: (row.relationship as string) || "",
    role: row.access_level as TrustedContact["role"],
    access_granted: row.invitation_status === "accepted",
    invited_at: (row.invited_at as string) || (row.created_at as string),
    accepted_at: (row.accepted_at as string) || undefined,
  };
}

function mapImportantContact(row: Record<string, unknown>): ImportantContact {
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    name: row.name as string,
    role: row.role as string,
    organization: (row.company as string) || undefined,
    phone: (row.phone as string) || undefined,
    email: (row.email as string) || undefined,
    notes: (row.notes as string) || undefined,
  };
}

function mapDocument(row: Record<string, unknown>): StoredDocument {
  return {
    id: row.id as string,
    title: row.title as string,
    category: row.category as StoredDocument["category"],
    fileName: row.file_name as string,
    fileSize: Number(row.file_size) || 0,
    mimeType: undefined,
    hasFile: Boolean(row.file_path),
    notes: (row.notes as string) || undefined,
    uploadedAt: (row.uploaded_at as string) || new Date().toISOString(),
    filePath: row.file_path as string | undefined,
    encryptionIv: row.encryption_iv as string | undefined,
    encryptionKey: row.encryption_key as string | undefined,
  };
}

function mapDigitalAsset(row: Record<string, unknown>): StoredDigitalAsset {
  return {
    id: row.id as string,
    name: row.name as string,
    type: row.type as string,
    url: (row.url as string) || "",
    username: (row.username as string) || "",
    action: row.action as StoredDigitalAsset["action"],
    notes: (row.notes as string) || "",
  };
}

function rowsToChecklist(rows: { item_id: string; list_type: string; completed: boolean }[]): StoredChecklistState {
  const state: StoredChecklistState = { before: {}, after: {} };
  for (const row of rows) {
    const bucket = row.list_type === "after" ? state.after : state.before;
    bucket[row.item_id] = row.completed;
  }
  return state;
}

export type LegacyVaultData = {
  trustedContacts: TrustedContact[];
  importantContacts: ImportantContact[];
  digitalAssets: StoredDigitalAsset[];
  documents: StoredDocument[];
  checklist: StoredChecklistState;
};

export async function fetchLegacyVaultData(): Promise<LegacyVaultData | null> {
  if (!isSupabaseConfigured()) return null;

  const { supabase, user } = await requireUser();

  const [contactsRes, importantRes, digitalRes, docsRes, checklistRes] = await Promise.all([
    supabase.from("trusted_contacts").select("*").eq("user_id", user.id).order("created_at"),
    supabase.from("important_contacts").select("*").eq("user_id", user.id).order("created_at"),
    supabase.from("digital_assets").select("*").eq("user_id", user.id).order("created_at"),
    supabase.from("documents").select("*").eq("user_id", user.id).order("uploaded_at", { ascending: false }),
    supabase.from("checklist_progress").select("item_id, list_type, completed").eq("user_id", user.id),
  ]);

  if (contactsRes.error) throw new Error(contactsRes.error.message);

  return {
    trustedContacts: (contactsRes.data ?? []).map(mapTrustedContact),
    importantContacts: (importantRes.data ?? []).map(mapImportantContact),
    digitalAssets: (digitalRes.data ?? []).map(mapDigitalAsset),
    documents: (docsRes.data ?? []).map(mapDocument),
    checklist: rowsToChecklist(checklistRes.data ?? []),
  };
}

export async function migrateLocalLegacyToCloud(local: LegacyVaultData): Promise<{ migrated: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { migrated: false };

  try {
    const { supabase, user } = await requireUser();

    const [tc, ic, da, dc, clBefore, clAfter] = await Promise.all([
      supabase.from("trusted_contacts").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("important_contacts").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("digital_assets").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("documents").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("checklist_progress").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("list_type", "before"),
      supabase.from("checklist_progress").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("list_type", "after"),
    ]);

    const hasCloud =
      (tc.count ?? 0) > 0 ||
      (ic.count ?? 0) > 0 ||
      (da.count ?? 0) > 0 ||
      (dc.count ?? 0) > 0 ||
      (clBefore.count ?? 0) > 0 ||
      (clAfter.count ?? 0) > 0;

    if (hasCloud) return { migrated: false };

    const hasLocal =
      local.trustedContacts.length > 0 ||
      local.documents.length > 0 ||
      local.importantContacts.length > 0 ||
      local.digitalAssets.length > 0 ||
      Object.keys(local.checklist.before).length > 0 ||
      Object.keys(local.checklist.after).length > 0;

    if (!hasLocal) return { migrated: false };

    for (const c of local.trustedContacts) {
      await supabase.from("trusted_contacts").insert({
        user_id: user.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        relationship: c.relationship,
        access_level: c.role,
        invitation_status: c.access_granted ? "accepted" : "pending",
        invited_at: c.invited_at,
        accepted_at: c.accepted_at,
      });
    }

    for (const c of local.importantContacts) {
      await supabase.from("important_contacts").insert({
        user_id: user.id,
        name: c.name,
        role: c.role,
        company: c.organization,
        phone: c.phone,
        email: c.email,
        notes: c.notes,
      });
    }

    for (const a of local.digitalAssets) {
      await supabase.from("digital_assets").insert({
        user_id: user.id,
        name: a.name,
        type: a.type,
        url: a.url,
        username: a.username,
        action: a.action,
        notes: a.notes,
      });
    }

    for (const d of local.documents) {
      await supabase.from("documents").insert({
        id: d.id,
        user_id: user.id,
        title: d.title,
        category: d.category,
        file_name: d.fileName,
        file_size: d.fileSize,
        file_path: d.filePath || `local/${d.id}`,
        encryption_iv: d.encryptionIv || "local",
        encryption_key: d.encryptionKey,
        notes: d.notes,
      });
    }

    const checklistRows: { user_id: string; item_id: string; list_type: string; completed: boolean }[] = [];
    for (const [itemId, completed] of Object.entries(local.checklist.before)) {
      if (completed) checklistRows.push({ user_id: user.id, item_id: itemId, list_type: "before", completed: true });
    }
    for (const [itemId, completed] of Object.entries(local.checklist.after)) {
      if (completed) checklistRows.push({ user_id: user.id, item_id: itemId, list_type: "after", completed: true });
    }
    if (checklistRows.length > 0) {
      await supabase.from("checklist_progress").upsert(checklistRows, { onConflict: "user_id,item_id,list_type" });
    }

    revalidatePath("/dashboard");
    return { migrated: true };
  } catch (e) {
    return { migrated: false, error: e instanceof Error ? e.message : "Migration failed" };
  }
}

export async function deleteTrustedContact(id: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("trusted_contacts").delete().eq("id", id).eq("user_id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/contacts");
  return { success: true };
}

export async function deleteImportantContact(id: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("important_contacts").delete().eq("id", id).eq("user_id", user.id);
  if (error) return { error: error.message };
  return { success: true };
}

export async function saveImportantContact(
  contact: ImportantContact,
  isNew: boolean
): Promise<{ contact?: ImportantContact; error?: string }> {
  const { supabase, user } = await requireUser();
  const payload = {
    user_id: user.id,
    name: contact.name,
    role: contact.role,
    company: contact.organization,
    phone: contact.phone,
    email: contact.email,
    notes: contact.notes,
  };

  if (isNew) {
    const { data, error } = await supabase.from("important_contacts").insert(payload).select().single();
    if (error) return { error: error.message };
    return { contact: mapImportantContact(data) };
  }

  const { data, error } = await supabase
    .from("important_contacts")
    .update(payload)
    .eq("id", contact.id)
    .eq("user_id", user.id)
    .select()
    .single();
  if (error) return { error: error.message };
  return { contact: mapImportantContact(data) };
}

export async function deleteDigitalAsset(id: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("digital_assets").delete().eq("id", id).eq("user_id", user.id);
  if (error) return { error: error.message };
  return { success: true };
}

export async function saveDigitalAsset(
  asset: StoredDigitalAsset,
  isNew: boolean
): Promise<{ asset?: StoredDigitalAsset; error?: string }> {
  const { supabase, user } = await requireUser();
  const payload = {
    user_id: user.id,
    name: asset.name,
    type: asset.type,
    url: asset.url,
    username: asset.username,
    action: asset.action,
    notes: asset.notes,
  };

  if (isNew) {
    const { data, error } = await supabase.from("digital_assets").insert(payload).select().single();
    if (error) return { error: error.message };
    return { asset: mapDigitalAsset(data) };
  }

  const { data, error } = await supabase
    .from("digital_assets")
    .update(payload)
    .eq("id", asset.id)
    .eq("user_id", user.id)
    .select()
    .single();
  if (error) return { error: error.message };
  return { asset: mapDigitalAsset(data) };
}

export async function syncChecklistItem(
  listType: "before" | "after",
  itemId: string,
  completed: boolean
): Promise<{ error?: string }> {
  const { supabase, user } = await requireUser();

  if (completed) {
    const { error } = await supabase.from("checklist_progress").upsert(
      {
        user_id: user.id,
        item_id: itemId,
        list_type: listType,
        completed: true,
        completed_at: new Date().toISOString(),
      },
      { onConflict: "user_id,item_id,list_type" }
    );
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase
      .from("checklist_progress")
      .delete()
      .eq("user_id", user.id)
      .eq("item_id", itemId)
      .eq("list_type", listType);
    if (error) return { error: error.message };
  }

  return {};
}

export async function saveDocumentRecord(
  doc: StoredDocument,
  encryptionKey?: string
): Promise<{ document?: StoredDocument; error?: string }> {
  const { supabase, user } = await requireUser();

  const { data, error } = await supabase
    .from("documents")
    .insert({
      id: doc.id,
      user_id: user.id,
      title: doc.title,
      category: doc.category,
      file_name: doc.fileName,
      file_size: doc.fileSize,
      file_path: doc.filePath || `${user.id}/${doc.id}.enc`,
      encryption_iv: doc.encryptionIv || "",
      encryption_key: encryptionKey || doc.encryptionKey,
      notes: doc.notes,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  return { document: mapDocument(data) };
}

export async function deleteDocumentRecord(id: string, filePath?: string) {
  const { supabase, user } = await requireUser();

  if (filePath && filePath.startsWith(user.id)) {
    await supabase.storage.from("documents").remove([filePath]);
  }

  const { error } = await supabase.from("documents").delete().eq("id", id).eq("user_id", user.id);
  if (error) return { error: error.message };
  return { success: true };
}

export type VaultAccessRequestRow = {
  id: string;
  vaultOwnerId: string;
  ownerName: string;
  requesterName: string;
  status: string;
  confirmationsNeeded: number;
  confirmationsReceived: number;
  requestedAt: string;
  reason?: string;
};

export async function fetchPendingVaultAccessRequests(): Promise<VaultAccessRequestRow[]> {
  if (!isSupabaseConfigured()) return [];

  const { supabase, user } = await requireUser();
  const { data: profile } = await supabase.from("profiles").select("email").eq("id", user.id).single();
  if (!profile?.email) return [];

  const { data: myContacts } = await supabase
    .from("trusted_contacts")
    .select("id, user_id")
    .eq("email", profile.email)
    .eq("invitation_status", "accepted");

  if (!myContacts?.length) return [];

  const ownerIds = [...new Set(myContacts.map((c) => c.user_id))];
  const contactIds = myContacts.map((c) => c.id);

  const { data: requests } = await supabase
    .from("vault_access_requests")
    .select("*")
    .eq("status", "pending")
    .in("vault_owner_id", ownerIds);

  if (!requests?.length) return [];

  const ownerProfiles = await supabase
    .from("profiles")
    .select("id, first_name, last_name")
    .in("id", ownerIds);

  const requesterIds = requests.map((r) => r.requester_id);
  const { data: requesters } = await supabase.from("trusted_contacts").select("id, name").in("id", requesterIds);

  const ownerMap = new Map((ownerProfiles.data ?? []).map((p) => [p.id, `${p.first_name} ${p.last_name}`.trim()]));
  const requesterMap = new Map((requesters ?? []).map((r) => [r.id, r.name]));

  return requests
    .filter((r) => {
      const isRequester = contactIds.includes(r.requester_id);
      const isConfirmer = ownerIds.includes(r.vault_owner_id) && !isRequester;
      return isRequester || isConfirmer;
    })
    .map((r) => ({
      id: r.id,
      vaultOwnerId: r.vault_owner_id,
      ownerName: ownerMap.get(r.vault_owner_id) || "Vault owner",
      requesterName: requesterMap.get(r.requester_id) || "Someone",
      status: r.status,
      confirmationsNeeded: r.confirmations_needed,
      confirmationsReceived: r.confirmations_received,
      requestedAt: r.requested_at,
      reason: r.reason,
    }));
}

export async function fetchGrantedVaultOwnerId(): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;

  const { supabase, user } = await requireUser();
  const { data: profile } = await supabase.from("profiles").select("email").eq("id", user.id).single();
  if (!profile?.email) return null;

  const { data: contact } = await supabase
    .from("trusted_contacts")
    .select("id")
    .eq("email", profile.email)
    .eq("invitation_status", "accepted")
    .limit(1)
    .maybeSingle();

  if (!contact) return null;

  const { data: request } = await supabase
    .from("vault_access_requests")
    .select("vault_owner_id")
    .eq("requester_id", contact.id)
    .eq("status", "approved")
    .order("resolved_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return request?.vault_owner_id ?? null;
}

export async function fetchGrantedVaultData(ownerId: string): Promise<LegacyVaultData | null> {
  if (!isSupabaseConfigured()) return null;

  const { supabase, user } = await requireUser();
  const { data: profile } = await supabase.from("profiles").select("email").eq("id", user.id).single();
  if (!profile?.email) return null;

  const { data: contact } = await supabase
    .from("trusted_contacts")
    .select("id")
    .eq("user_id", ownerId)
    .eq("email", profile.email)
    .eq("invitation_status", "accepted")
    .maybeSingle();

  if (!contact) return null;

  const { data: request } = await supabase
    .from("vault_access_requests")
    .select("status")
    .eq("requester_id", contact.id)
    .eq("vault_owner_id", ownerId)
    .eq("status", "approved")
    .maybeSingle();

  if (!request) return null;

  const [importantRes, docsRes, checklistRes] = await Promise.all([
    supabase.from("important_contacts").select("*").eq("user_id", ownerId).order("created_at"),
    supabase.from("documents").select("*").eq("user_id", ownerId).order("uploaded_at", { ascending: false }),
    supabase.from("checklist_progress").select("item_id, list_type, completed").eq("user_id", ownerId),
  ]);

  return {
    trustedContacts: [],
    importantContacts: (importantRes.data ?? []).map(mapImportantContact),
    digitalAssets: [],
    documents: (docsRes.data ?? []).map(mapDocument),
    checklist: rowsToChecklist(checklistRes.data ?? []),
  };
}
