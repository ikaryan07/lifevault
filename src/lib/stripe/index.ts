import Stripe from "stripe";
import type { BillingInterval, PlanId } from "@/lib/plans";

let stripeClient: Stripe | null = null;

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}

export function getStripe(): Stripe {
  if (!isStripeConfigured()) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }
  return stripeClient;
}

function envPrice(...keys: string[]): string | null {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return null;
}

export function stripePriceIdForPlan(
  planId: PlanId,
  interval: BillingInterval = "monthly"
): string | null {
  if (planId === "free") return null;

  if (planId === "family") {
    if (interval === "annual") {
      return envPrice("STRIPE_PRICE_FAMILY_ANNUAL", "STRIPE_PRICE_FAMILY_YEARLY");
    }
    return envPrice("STRIPE_PRICE_FAMILY_MONTHLY", "STRIPE_PRICE_FAMILY");
  }

  if (planId === "legacy") {
    if (interval === "annual") {
      return envPrice("STRIPE_PRICE_LEGACY_ANNUAL", "STRIPE_PRICE_LEGACY_YEARLY");
    }
    return envPrice("STRIPE_PRICE_LEGACY_MONTHLY", "STRIPE_PRICE_LEGACY");
  }

  return null;
}

export function planIdFromStripePrice(priceId: string): PlanId {
  const normalized = priceId.trim();
  const legacyPrices = [
    process.env.STRIPE_PRICE_LEGACY_MONTHLY,
    process.env.STRIPE_PRICE_LEGACY,
    process.env.STRIPE_PRICE_LEGACY_ANNUAL,
    process.env.STRIPE_PRICE_LEGACY_YEARLY,
  ].map((p) => p?.trim());

  if (legacyPrices.includes(normalized)) return "legacy";
  return "family";
}

export function mapStripeStatus(status: Stripe.Subscription.Status): string {
  switch (status) {
    case "trialing":
      return "trialing";
    case "active":
      return "active";
    case "past_due":
    case "unpaid":
      return "past_due";
    case "canceled":
    case "incomplete_expired":
      return "canceled";
    default:
      return "none";
  }
}
