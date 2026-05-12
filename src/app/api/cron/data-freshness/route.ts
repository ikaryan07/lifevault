import { createServerClient } from "@supabase/ssr";
import { sendEmail } from "@/lib/services/email";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() {},
      },
    }
  );

  const threeMonthsAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

  const { data: staleDocUsers } = await supabase
    .from("documents")
    .select("user_id, title, updated_at")
    .lt("updated_at", threeMonthsAgo)
    .order("updated_at", { ascending: true });

  if (!staleDocUsers || staleDocUsers.length === 0) {
    return NextResponse.json({ message: "No stale documents found" });
  }

  const userMap = new Map<string, string[]>();
  for (const doc of staleDocUsers) {
    const existing = userMap.get(doc.user_id) || [];
    existing.push(doc.title);
    userMap.set(doc.user_id, existing);
  }

  let sent = 0;
  for (const [userId, docTitles] of userMap.entries()) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name, email")
      .eq("id", userId)
      .single();

    if (!profile) continue;

    const docList = docTitles.slice(0, 3).map((t) => `• ${t}`).join("\n");
    const moreCount = docTitles.length > 3 ? ` and ${docTitles.length - 3} more` : "";

    try {
      await sendEmail({
        to: profile.email,
        subject: `LifeVault: Some of your documents may need reviewing`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #1a1a2e; font-size: 24px; margin: 0;">LifeVault</h1>
            </div>
            <div style="background: #f8f9fa; border-radius: 12px; padding: 30px;">
              <h2 style="color: #1a1a2e; margin-top: 0;">Hi ${profile.first_name},</h2>
              <p style="color: #444; line-height: 1.6;">
                Some documents in your vault haven't been reviewed in over 3 months. 
                It's good practice to check they're still accurate:
              </p>
              <div style="background: white; border-radius: 8px; padding: 15px; margin: 15px 0; border: 1px solid #eee;">
                <pre style="margin: 0; font-family: inherit; white-space: pre-wrap;">${docList}${moreCount}</pre>
              </div>
              <p style="color: #444; line-height: 1.6;">
                No action needed if everything is still correct — this is just a gentle reminder.
              </p>
              <div style="text-align: center; margin: 25px 0;">
                <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/vault" style="background: #1a5276; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                  Review My Documents
                </a>
              </div>
            </div>
          </div>
        `,
      });
      sent++;
    } catch (err) {
      console.error(`Failed to send freshness reminder to ${profile.email}:`, err);
    }
  }

  return NextResponse.json({ message: `Sent ${sent} freshness reminders` });
}
