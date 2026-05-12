import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { redirect } from "next/navigation";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const supabase = await createClient();

  const { error } = await supabase
    .from("trusted_contacts")
    .update({
      invitation_status: "accepted",
      accepted_at: new Date().toISOString(),
    })
    .eq("invitation_token", token)
    .eq("invitation_status", "pending");

  if (error) {
    return NextResponse.json({ error: "Failed to accept invitation" }, { status: 500 });
  }

  redirect("/login?message=invitation_accepted");
}
