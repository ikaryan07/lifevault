import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  isStripeConfigured,
  getStripe,
  planIdFromStripePrice,
  mapStripeStatus,
} from "@/lib/stripe";
import { setFamilyPlanFromStripe } from "@/lib/subscriptions/server";
import type { PlanId } from "@/lib/plans";
import type Stripe from "stripe";

export const runtime = "nodejs";

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const familyId = session.metadata?.family_id;
  const planId = (session.metadata?.plan_id ?? "family") as PlanId;
  if (!familyId) return;

  await setFamilyPlanFromStripe(familyId, {
    planId,
    subscriptionStatus: "trialing",
    stripeCustomerId: session.customer as string | undefined,
    stripeSubscriptionId: session.subscription as string | undefined,
  });
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const familyId = subscription.metadata?.family_id;
  if (!familyId) return;

  const priceId = subscription.items.data[0]?.price.id;
  const planId = priceId ? planIdFromStripePrice(priceId) : "family";

  await setFamilyPlanFromStripe(familyId, {
    planId,
    subscriptionStatus: mapStripeStatus(subscription.status),
    stripeCustomerId: subscription.customer as string,
    stripeSubscriptionId: subscription.id,
    trialEndsAt: subscription.trial_end
      ? new Date(subscription.trial_end * 1000).toISOString()
      : null,
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const familyId = subscription.metadata?.family_id;
  if (!familyId) return;

  await setFamilyPlanFromStripe(familyId, {
    planId: "free",
    subscriptionStatus: "canceled",
    stripeCustomerId: subscription.customer as string,
    stripeSubscriptionId: subscription.id,
    trialEndsAt: null,
  });
}

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Missing webhook signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Invalid signature" },
      { status: 400 }
    );
  }

  // Service role not required — updates go through server client with user's RLS?
  // Webhook runs without user — need service role for family updates
  // For now use createClient which may fail RLS. Add service role client.

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionChange(event.data.object as Stripe.Subscription);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      default:
        break;
    }
  } catch (e) {
    console.error("Stripe webhook error:", e);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  // Touch supabase to ensure module loads (webhook uses service in setFamilyPlanFromStripe)
  await createClient();

  return NextResponse.json({ received: true });
}
