import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { requestId, confirmed } = body;

  const { data: accessRequest } = await supabase
    .from("vault_access_requests")
    .select("*")
    .eq("id", requestId)
    .single();

  if (!accessRequest) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  if (accessRequest.status !== "pending") {
    return NextResponse.json({ error: "Request is no longer pending" }, { status: 400 });
  }

  const { data: confirmerContact } = await supabase
    .from("trusted_contacts")
    .select("*")
    .eq("user_id", accessRequest.vault_owner_id)
    .eq("email", user.email)
    .eq("invitation_status", "accepted")
    .single();

  if (!confirmerContact) {
    return NextResponse.json({ error: "Not authorized to confirm" }, { status: 403 });
  }

  await supabase.from("vault_access_confirmations").insert({
    request_id: requestId,
    confirmer_id: confirmerContact.id,
    confirmed,
  });

  if (confirmed) {
    const newCount = accessRequest.confirmations_received + 1;

    const updates: any = { confirmations_received: newCount };
    if (newCount >= accessRequest.confirmations_needed) {
      updates.status = "approved";
      updates.resolved_at = new Date().toISOString();
    }

    await supabase
      .from("vault_access_requests")
      .update(updates)
      .eq("id", requestId);
  } else {
    await supabase
      .from("vault_access_requests")
      .update({ status: "denied", resolved_at: new Date().toISOString() })
      .eq("id", requestId);
  }

  await supabase.from("audit_log").insert({
    user_id: accessRequest.vault_owner_id,
    action: confirmed ? "vault_access_confirmed" : "vault_access_denied",
    resource_type: "vault_access_request",
    resource_id: requestId,
    metadata: { confirmer: confirmerContact.name },
  });

  return NextResponse.json({ success: true });
}
