import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { redirect } from "next/navigation";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/invite/${token}`);
  }

  const { data: contact } = await supabase
    .from("trusted_contacts")
    .select("*")
    .eq("invitation_token", token)
    .eq("invitation_status", "pending")
    .maybeSingle();

  if (!contact) {
    return NextResponse.json({ error: "Invalid or expired invitation" }, { status: 404 });
  }

  if (contact.email.toLowerCase() !== user.email?.toLowerCase()) {
    return NextResponse.json(
      { error: "This invitation was sent to a different email address. Sign in with that account." },
      { status: 403 }
    );
  }

  const { error } = await supabase
    .from("trusted_contacts")
    .update({
      invitation_status: "accepted",
      accepted_at: new Date().toISOString(),
      contact_user_id: user.id,
    })
    .eq("id", contact.id);

  if (error) {
    return NextResponse.json({ error: "Failed to accept invitation" }, { status: 500 });
  }

  redirect("/dashboard/vault-access?message=invite_accepted");
}
