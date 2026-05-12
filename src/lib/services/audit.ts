import { createClient } from "@/lib/supabase/client";

export type AuditAction =
  | "document_uploaded"
  | "document_deleted"
  | "document_viewed"
  | "trusted_contact_invited"
  | "trusted_contact_removed"
  | "checklist_item_completed"
  | "vault_access_requested"
  | "vault_access_confirmed"
  | "vault_access_denied"
  | "profile_updated"
  | "password_changed"
  | "check_in"
  | "login"
  | "logout";

export async function logAuditEvent(
  userId: string,
  action: AuditAction,
  options?: {
    resourceType?: string;
    resourceId?: string;
    metadata?: Record<string, any>;
  }
) {
  const supabase = createClient();

  await supabase.from("audit_log").insert({
    user_id: userId,
    action,
    resource_type: options?.resourceType,
    resource_id: options?.resourceId,
    metadata: options?.metadata || {},
  });
}

export async function getAuditLog(userId: string, limit = 50) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("audit_log")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}
