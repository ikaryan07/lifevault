import { createServerClient } from "@supabase/ssr";
import { sendEmail, checkInReminderEmail } from "@/lib/services/email";
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

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .not("last_check_in", "is", null);

  const overdueUsers = (profiles ?? []).filter((user) => {
    const daysSince = Math.floor(
      (Date.now() - new Date(user.last_check_in).getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSince >= (user.check_in_interval_days || 30);
  });

  if (overdueUsers.length === 0) {
    return NextResponse.json({ message: "No overdue users" });
  }

  let sent = 0;
  for (const user of overdueUsers) {
    const daysSince = Math.floor(
      (Date.now() - new Date(user.last_check_in).getTime()) / (1000 * 60 * 60 * 24)
    );

    try {
      const emailContent = checkInReminderEmail(user.first_name, daysSince);
      await sendEmail({ to: user.email, ...emailContent });
      sent++;
    } catch (err) {
      console.error(`Failed to send check-in to ${user.email}:`, err);
    }
  }

  return NextResponse.json({ message: `Sent ${sent} check-in reminders` });
}
