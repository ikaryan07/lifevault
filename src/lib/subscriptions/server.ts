import { createClient } from "@/lib/supabase/server";
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/auth/demo";
import {
  getPlan,
  isAtLimit,
  type PlanId,
  type PlanLimitKey,
  TRIAL_DAYS,
} from "@/lib/plans";

export type FamilySubscriptionRow = {
  id: string;
  owner_id: string;
  plan_id: PlanId;
  trial_ends_at: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: string;
};

export type SubscriptionSnapshot = {
  planId: PlanId;
  trialEndsAt: string | null;
  subscriptionStatus: string;
  isOwner: boolean;
  familyId: string | null;
  memberCount: number;
  stripeCustomerId: string | null;
};

export function resolveEffectivePlanId(row: FamilySubscriptionRow): PlanId {
  const stored = (row.plan_id ?? "free") as PlanId;
  if (stored === "free") return "free";

  const status = row.subscription_status ?? "none";
  if (status === "active" || status === "trialing") return stored;

  if (row.trial_ends_at) {
    const trialEnd = new Date(row.trial_ends_at);
    if (trialEnd > new Date()) return stored;
  }

  return "free";
}

async function getFamilyRowForUser(userId: string): Promise<{
  family: FamilySubscriptionRow | null;
  memberCount: number;
  isOwner: boolean;
}> {
  const supabase = await createClient();

  const { data: membership } = await supabase
    .from("family_members")
    .select("family_id, role")
    .eq("user_id", userId)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (!membership?.family_id) {
    return { family: null, memberCount: 0, isOwner: false };
  }

  const [{ data: family, error: famErr }, { count }] = await Promise.all([
    supabase
      .from("families")
      .select(
        "id, owner_id, plan_id, trial_ends_at, stripe_customer_id, stripe_subscription_id, subscription_status"
      )
      .eq("id", membership.family_id)
      .single(),
    supabase
      .from("family_members")
      .select("id", { count: "exact", head: true })
      .eq("family_id", membership.family_id)
      .eq("status", "active"),
  ]);

  if (famErr || !family) {
    return { family: null, memberCount: 0, isOwner: false };
  }

  return {
    family: family as FamilySubscriptionRow,
    memberCount: count ?? 0,
    isOwner: family.owner_id === userId || membership.role === "owner",
  };
}

export async function getSubscriptionForUser(userId: string): Promise<SubscriptionSnapshot> {
  if (!isSupabaseConfigured()) {
    return {
      planId: "free",
      trialEndsAt: null,
      subscriptionStatus: "none",
      isOwner: true,
      familyId: null,
      memberCount: 1,
      stripeCustomerId: null,
    };
  }

  const { family, memberCount, isOwner } = await getFamilyRowForUser(userId);

  if (!family) {
    return {
      planId: "free",
      trialEndsAt: null,
      subscriptionStatus: "none",
      isOwner: true,
      familyId: null,
      memberCount: 1,
      stripeCustomerId: null,
    };
  }

  const planId = resolveEffectivePlanId(family);

  return {
    planId,
    trialEndsAt: family.trial_ends_at,
    subscriptionStatus: family.subscription_status ?? "none",
    isOwner,
    familyId: family.id,
    memberCount,
    stripeCustomerId: family.stripe_customer_id,
  };
}

export async function requireFamilyOwner(userId: string): Promise<FamilySubscriptionRow> {
  const { family, isOwner } = await getFamilyRowForUser(userId);
  if (!family) throw new Error("No family found");
  if (!isOwner) throw new Error("Only the family owner can manage billing");
  return family;
}

export async function startFamilyTrial(userId: string, planId: PlanId): Promise<{ error?: string }> {
  if (planId === "free") return { error: "Cannot start a trial for the free plan" };
  if (!isSupabaseConfigured()) return { error: "Cloud not configured" };

  const supabase = await createClient();
  const family = await requireFamilyOwner(userId);

  const trialEnds = new Date();
  trialEnds.setDate(trialEnds.getDate() + TRIAL_DAYS);

  const { error } = await supabase
    .from("families")
    .update({
      plan_id: planId,
      trial_ends_at: trialEnds.toISOString(),
      subscription_status: "trialing",
    })
    .eq("id", family.id)
    .eq("owner_id", userId);

  if (error) return { error: error.message };
  return {};
}

export async function setFamilyPlanFromStripe(
  familyId: string,
  data: {
    planId: PlanId;
    subscriptionStatus: string;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    trialEndsAt?: string | null;
  }
) {
  const supabase = hasAdminClient() ? createAdminClient() : await createClient();
  const { error } = await supabase
    .from("families")
    .update({
      plan_id: data.planId,
      subscription_status: data.subscriptionStatus,
      stripe_customer_id: data.stripeCustomerId,
      stripe_subscription_id: data.stripeSubscriptionId,
      trial_ends_at: data.trialEndsAt ?? null,
    })
    .eq("id", familyId);

  if (error) throw new Error(error.message);
}

export async function getFamilyPlanLimits(userId: string) {
  const snapshot = await getSubscriptionForUser(userId);
  return getPlan(snapshot.planId).limits;
}

export async function assertWithinLimit(
  userId: string,
  key: PlanLimitKey,
  currentCount: number
): Promise<{ error?: string }> {
  const limits = await getFamilyPlanLimits(userId);
  const limit = limits[key];
  if (isAtLimit(currentCount, limit)) {
    const plan = getPlan(
      (await getSubscriptionForUser(userId)).planId
    );
    return {
      error: `${plan.name} plan limit reached (${formatLimitLabel(key, limit)}). Ask your family owner to upgrade.`,
    };
  }
  return {};
}

function formatLimitLabel(key: PlanLimitKey, limit: number): string {
  const labels: Record<PlanLimitKey, string> = {
    passwords: "passwords",
    household: "household items",
    documents: "documents",
    trustedContacts: "trusted contacts",
    familyMembers: "family members",
  };
  const name = labels[key];
  return Number.isFinite(limit) ? `max ${limit} ${name}` : name;
}

export async function assertCanAddFamilyMember(familyId: string): Promise<{ error?: string }> {
  if (!isSupabaseConfigured()) return {};

  type JoinMeta = {
    id: string;
    plan_id: PlanId;
    trial_ends_at: string | null;
    subscription_status: string;
    stripe_customer_id: string | null;
    stripe_subscription_id: string | null;
    member_count: number;
  };

  let meta: JoinMeta | null = null;
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_family_join_meta", {
    target_family_id: familyId,
  });

  if (!error && data) {
    const row = Array.isArray(data) ? data[0] : data;
    if (row?.id) {
      meta = {
        id: row.id as string,
        plan_id: (row.plan_id ?? "free") as PlanId,
        trial_ends_at: row.trial_ends_at as string | null,
        subscription_status: (row.subscription_status ?? "none") as string,
        stripe_customer_id: row.stripe_customer_id as string | null,
        stripe_subscription_id: row.stripe_subscription_id as string | null,
        member_count: Number(row.member_count ?? 0),
      };
    }
  }

  if (!meta && hasAdminClient()) {
    const admin = createAdminClient();
    const { data: family } = await admin
      .from("families")
      .select(
        "id, plan_id, trial_ends_at, stripe_customer_id, stripe_subscription_id, subscription_status"
      )
      .eq("id", familyId)
      .single();

    if (family) {
      const { count } = await admin
        .from("family_members")
        .select("id", { count: "exact", head: true })
        .eq("family_id", familyId)
        .eq("status", "active");

      meta = {
        id: family.id,
        plan_id: (family.plan_id ?? "free") as PlanId,
        trial_ends_at: family.trial_ends_at,
        subscription_status: family.subscription_status ?? "none",
        stripe_customer_id: family.stripe_customer_id,
        stripe_subscription_id: family.stripe_subscription_id,
        member_count: count ?? 0,
      };
    }
  }

  if (!meta) return { error: "Family not found" };

  const planId = resolveEffectivePlanId({
    id: meta.id,
    owner_id: "",
    plan_id: meta.plan_id,
    trial_ends_at: meta.trial_ends_at,
    stripe_customer_id: meta.stripe_customer_id,
    stripe_subscription_id: meta.stripe_subscription_id,
    subscription_status: meta.subscription_status,
  });
  const limits = getPlan(planId).limits;

  const current = meta.member_count;
  if (isAtLimit(current, limits.familyMembers)) {
    return {
      error: `This family has reached its member limit (${limits.familyMembers}). The family owner needs to upgrade to Family or Legacy to invite more people.`,
    };
  }

  if (planId === "free" && current >= 1) {
    return {
      error:
        "This family is on the Free plan (solo use). The family owner needs to upgrade to Family so others can join.",
    };
  }

  return {};
}
