"use server";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/auth/demo";
import { getSiteUrl } from "@/lib/auth/site-url";
import {
  getSubscriptionForUser,
  requireFamilyOwner,
  startFamilyTrial,
} from "@/lib/subscriptions/server";
import { getPlan, type PlanId } from "@/lib/plans";
import { isStripeConfigured, getStripe, stripePriceIdForPlan } from "@/lib/stripe";

export type SubscriptionStatus = Awaited<ReturnType<typeof getSubscriptionStatus>>;

export async function getSubscriptionStatus() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      authenticated: false as const,
      cloudEnabled: isSupabaseConfigured(),
      stripeConfigured: isStripeConfigured(),
    };
  }

  const snapshot = await getSubscriptionForUser(user.id);
  const plan = getPlan(snapshot.planId);

  return {
    authenticated: true as const,
    cloudEnabled: isSupabaseConfigured(),
    stripeConfigured: isStripeConfigured(),
    ...snapshot,
    plan,
  };
}

export async function startPlanTrial(planId: PlanId) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };

  if (isStripeConfigured()) {
    return {
      error: "Payments are enabled — use checkout to start your subscription.",
      redirectToCheckout: true,
    };
  }

  return startFamilyTrial(user.id, planId);
}

export async function createCheckoutSession(planId: PlanId) {
  if (!isStripeConfigured()) {
    return { error: "Payments are not configured yet. Start a free trial instead." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };

  const family = await requireFamilyOwner(user.id);
  const priceId = stripePriceIdForPlan(planId);
  if (!priceId) return { error: "Invalid plan for checkout" };

  const siteUrl = getSiteUrl();

  let customerId = family.stripe_customer_id ?? undefined;
  if (!customerId) {
    const customer = await getStripe().customers.create({
      email: user.email ?? undefined,
      metadata: { family_id: family.id, user_id: user.id },
    });
    customerId = customer.id;
    await supabase
      .from("families")
      .update({ stripe_customer_id: customerId })
      .eq("id", family.id);
  }

  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${siteUrl}/dashboard/settings/plan?checkout=success`,
    cancel_url: `${siteUrl}/dashboard/settings/plan?checkout=canceled`,
    subscription_data: {
      trial_period_days: 14,
      metadata: { family_id: family.id, plan_id: planId },
    },
    metadata: { family_id: family.id, plan_id: planId },
  });

  if (!session.url) return { error: "Could not create checkout session" };
  return { url: session.url };
}

export async function createBillingPortalSession() {
  if (!isStripeConfigured()) {
    return { error: "Billing portal is not available yet." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };

  const family = await requireFamilyOwner(user.id);
  if (!family.stripe_customer_id) {
    return { error: "No billing account found. Subscribe to a paid plan first." };
  }

  const session = await getStripe().billingPortal.sessions.create({
    customer: family.stripe_customer_id,
    return_url: `${getSiteUrl()}/dashboard/settings/plan`,
  });

  return { url: session.url };
}

export async function downgradeToFree() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };

  const family = await requireFamilyOwner(user.id);

  if (family.stripe_subscription_id && isStripeConfigured()) {
    return {
      error: "You have an active subscription. Use Manage billing to cancel in Stripe first.",
    };
  }

  const { error } = await supabase
    .from("families")
    .update({
      plan_id: "free",
      trial_ends_at: null,
      subscription_status: "none",
    })
    .eq("id", family.id)
    .eq("owner_id", user.id);

  if (error) return { error: error.message };
  return { success: true };
}
