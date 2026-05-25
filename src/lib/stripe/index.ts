import Stripe from "stripe";
import type { PlanId } from "@/lib/plans";

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

export function stripePriceIdForPlan(planId: PlanId): string | null {
  const map: Partial<Record<PlanId, string | undefined>> = {
    family: process.env.STRIPE_PRICE_FAMILY,
    legacy: process.env.STRIPE_PRICE_LEGACY,
  };
  const id = map[planId]?.trim();
  return id || null;
}

export function planIdFromStripePrice(priceId: string): PlanId {
  if (priceId === process.env.STRIPE_PRICE_LEGACY?.trim()) return "legacy";
  if (priceId === process.env.STRIPE_PRICE_FAMILY?.trim()) return "family";
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
