import { createServerClient } from "@supabase/ssr";
import { sendEmail, checkInReminderEmail } from "@/lib/services/email";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { resolveEffectivePlanId } from "@/lib/subscriptions/server";
import type { PlanId } from "@/lib/plans";

type FamilyPlanRow = {
  plan_id: PlanId;
  trial_ends_at: string | null;
  subscription_status: string;
};

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

  const [{ data: profiles }, { data: memberships }] = await Promise.all([
    supabase.from("profiles").select("*").not("last_check_in", "is", null),
    supabase
      .from("family_members")
      .select("user_id, families(plan_id, trial_ends_at, subscription_status)")
      .eq("status", "active"),
  ]);

  const legacyUserIds = new Set<string>();
  for (const row of memberships ?? []) {
    const family = row.families as FamilyPlanRow | FamilyPlanRow[] | null;
    const fam = Array.isArray(family) ? family[0] : family;
    if (!fam) continue;

    const planId = resolveEffectivePlanId({
      id: "",
      owner_id: "",
      plan_id: (fam.plan_id ?? "free") as PlanId,
      trial_ends_at: fam.trial_ends_at,
      stripe_customer_id: null,
      stripe_subscription_id: null,
      subscription_status: fam.subscription_status ?? "none",
    });

    if (planId === "legacy") {
      legacyUserIds.add(row.user_id as string);
    }
  }

  const overdueUsers = (profiles ?? []).filter((user) => {
    if (!legacyUserIds.has(user.id)) return false;
    const daysSince = Math.floor(
      (Date.now() - new Date(user.last_check_in).getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSince >= (user.check_in_interval_days || 30);
  });

  if (overdueUsers.length === 0) {
    return NextResponse.json({ message: "No overdue Legacy plan users" });
  }

  let sent = 0;
  let skipped = 0;
  for (const user of overdueUsers) {
    const daysSince = Math.floor(
      (Date.now() - new Date(user.last_check_in).getTime()) / (1000 * 60 * 60 * 24)
    );

    try {
      const emailContent = checkInReminderEmail(user.first_name, daysSince);
      const result = await sendEmail({ to: user.email, ...emailContent });
      if (result.success) {
        sent++;
      } else {
        skipped++;
      }
    } catch (err) {
      console.error(`Failed to send check-in to ${user.email}:`, err);
    }
  }

  return NextResponse.json({
    message: `Sent ${sent} check-in reminders (${skipped} skipped — email not configured)`,
  });
}
