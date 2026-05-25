"use client";

import { useState } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Check, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PLAN_ORDER,
  PLANS,
  getPlanPricing,
  signupUrl,
  type BillingInterval,
  type PlanId,
} from "@/lib/plans";
import { BillingToggle } from "@/components/subscription/billing-toggle";

export function Pricing() {
  const [interval, setInterval] = useState<BillingInterval>("monthly");

  return (
    <section id="pricing" className="border-t bg-card py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Simple, honest pricing
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            One family owner pays. Everyone they invite joins free and shares the same
            passwords and household info.
          </p>
          <div className="mt-8 flex justify-center">
            <BillingToggle value={interval} onChange={setInterval} />
          </div>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {PLAN_ORDER.map((planId) => {
            const plan = PLANS[planId];
            const display = getPlanPricing(planId, interval);
            const highlighted = planId === "family";

            return (
              <div
                key={planId}
                className={cn(
                  "relative flex flex-col rounded-2xl border p-8 transition-all",
                  highlighted
                    ? "border-primary bg-background shadow-2xl shadow-primary/10 ring-1 ring-primary/20 lg:scale-[1.04]"
                    : "bg-background hover:border-border/80 hover:shadow-md"
                )}
              >
                {highlighted && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-lg">
                    <Zap className="h-3 w-3" />
                    Most Popular
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-bold tracking-tight text-foreground">
                      {display.price}
                    </span>
                    <span className="text-sm text-muted-foreground">{display.period}</span>
                  </div>
                  {display.savings && interval === "annual" && planId !== "free" && (
                    <p className="mt-1 text-xs font-medium text-green-600 dark:text-green-400">
                      {display.savings}
                    </p>
                  )}
                  {display.sublabel && interval === "annual" && planId !== "free" && (
                    <p className="mt-1 text-xs text-muted-foreground">{display.sublabel}</p>
                  )}
                  <p className="mt-2 text-sm text-muted-foreground">{plan.tagline}</p>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    {plan.billingNote}
                  </p>
                </div>

                <Link
                  href={signupUrl(planId as PlanId, interval)}
                  className={cn(
                    buttonVariants({
                      variant: highlighted ? "default" : "outline",
                      size: "lg",
                    }),
                    "mt-6 w-full"
                  )}
                >
                  {planId === "free" ? "Get Started Free" : "Start 14-Day Free Trial"}
                </Link>

                <ul className="mt-8 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <p className="mt-12 text-center text-sm text-muted-foreground">
          All prices in AUD. AES-256 encryption and Australian data hosting on every plan.
          <br className="hidden sm:block" />
          Annual plans save 2 months. Cancel anytime from your account settings.
        </p>
      </div>
    </section>
  );
}
