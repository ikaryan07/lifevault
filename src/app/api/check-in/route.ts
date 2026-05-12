import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await supabase.from("check_ins").insert({
    user_id: user.id,
    method: "manual",
  });

  await supabase
    .from("profiles")
    .update({ last_check_in: new Date().toISOString() })
    .eq("id", user.id);

  return NextResponse.json({ success: true });
}
