import { createClient } from "@/lib/supabase/server";
import { sendEmail, invitationEmail } from "@/lib/services/email";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, email, relationship, accessLevel } = body;

  if (!name || !email) {
    return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
  }

  const token = crypto.randomUUID();

  const { data: contact, error } = await supabase
    .from("trusted_contacts")
    .insert({
      user_id: user.id,
      name,
      email,
      relationship,
      access_level: accessLevel || "on_death_only",
      invitation_token: token,
      invitation_status: "pending",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", user.id)
    .single();

  const inviterName = profile ? `${profile.first_name} ${profile.last_name}` : "Someone";

  try {
    const emailContent = invitationEmail(inviterName, token);
    const emailResult = await sendEmail({ to: email, ...emailContent });
    if (!emailResult.success && emailResult.mock) {
      return NextResponse.json({
        success: true,
        contact,
        emailWarning:
          "Contact saved, but the invitation email could not be sent. Share the invite link manually until email is configured.",
      });
    }
  } catch (err) {
    console.error("Failed to send invitation email:", err);
    return NextResponse.json({
      success: true,
      contact,
      emailWarning: "Contact saved, but the invitation email failed to send.",
    });
  }

  await supabase.from("audit_log").insert({
    user_id: user.id,
    action: "trusted_contact_invited",
    resource_type: "trusted_contact",
    resource_id: contact.id,
    metadata: { contact_email: email, access_level: accessLevel },
  });

  return NextResponse.json({ success: true, contact });
}
