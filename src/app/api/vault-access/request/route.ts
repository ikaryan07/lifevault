import { createClient } from "@/lib/supabase/server";
import { sendEmail, vaultAccessRequestEmail } from "@/lib/services/email";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { vaultOwnerId, reason } = body;

  const { data: requesterContact } = await supabase
    .from("trusted_contacts")
    .select("*")
    .eq("user_id", vaultOwnerId)
    .eq("email", user.email)
    .eq("invitation_status", "accepted")
    .single();

  if (!requesterContact) {
    return NextResponse.json(
      { error: "You are not an accepted trusted contact for this vault" },
      { status: 403 }
    );
  }

  const { data: otherContacts } = await supabase
    .from("trusted_contacts")
    .select("*")
    .eq("user_id", vaultOwnerId)
    .eq("invitation_status", "accepted")
    .neq("id", requesterContact.id);

  const confirmationsNeeded = Math.min(2, (otherContacts?.length || 0));

  const { data: accessRequest, error } = await supabase
    .from("vault_access_requests")
    .insert({
      vault_owner_id: vaultOwnerId,
      requester_id: requesterContact.id,
      reason,
      confirmations_needed: confirmationsNeeded,
      status: confirmationsNeeded === 0 ? "approved" : "pending",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (otherContacts && otherContacts.length > 0) {
    const { data: ownerProfile } = await supabase
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", vaultOwnerId)
      .single();

    const ownerName = ownerProfile ? `${ownerProfile.first_name} ${ownerProfile.last_name}` : "Someone";

    for (const contact of otherContacts) {
      try {
        const emailContent = vaultAccessRequestEmail(ownerName, requesterContact.name);
        await sendEmail({ to: contact.email, ...emailContent });
      } catch (err) {
        console.error(`Failed to send access request email to ${contact.email}:`, err);
      }
    }
  }

  await supabase.from("audit_log").insert({
    user_id: vaultOwnerId,
    action: "vault_access_requested",
    resource_type: "vault_access_request",
    resource_id: accessRequest.id,
    metadata: { requester_name: requesterContact.name, reason },
  });

  return NextResponse.json({ success: true, request: accessRequest });
}
