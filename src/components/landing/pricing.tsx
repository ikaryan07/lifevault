import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Check, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Try it out — no strings attached.",
    features: [
      "5 shared passwords & logins",
      "5 household info items",
      "5 document uploads",
      "1 trusted contact",
      "Basic planning checklist",
      "AES-256 encryption",
    ],
    cta: "Get Started",
    href: "/signup",
    highlighted: false,
  },
  {
    name: "Family",
    price: "$6.99",
    period: "/month",
    description: "Everything your household needs, every day.",
    features: [
      "Unlimited passwords & logins",
      "Unlimited household info",
      "Unlimited documents",
      "Up to 6 family members",
      "All checklists and guides",
      "Smart reminders",
      "Priority support",
    ],
    cta: "Start 14-Day Free Trial",
    href: "/signup?plan=family",
    highlighted: true,
    badge: "Most Popular",
  },
  {
    name: "Legacy",
    price: "$12.99",
    period: "/month",
    description: "Complete protection for life and beyond.",
    features: [
      "Everything in Family",
      "10 trusted contacts",
      "Encrypted video & audio messages",
      "Emergency access QR card",
      "Inactivity release trigger",
      "Australian forms library",
      "PDF vault export",
      "Phone support",
    ],
    cta: "Start 14-Day Free Trial",
    href: "/signup?plan=legacy",
    highlighted: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="border-t bg-card py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Simple, honest pricing
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Start free. Upgrade when your family needs more.
            No lock-in contracts. Cancel anytime.
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "relative flex flex-col rounded-2xl border p-8 transition-all",
                plan.highlighted
                  ? "border-primary bg-background shadow-2xl shadow-primary/10 ring-1 ring-primary/20 lg:scale-[1.04]"
                  : "bg-background hover:border-border/80 hover:shadow-md"
              )}
            >
              {plan.highlighted && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-lg">
                  <Zap className="h-3 w-3" />
                  {plan.badge}
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {plan.name}
                </h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {plan.period}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {plan.description}
                </p>
              </div>

              <Link
                href={plan.href}
                className={cn(
                  buttonVariants({
                    variant: plan.highlighted ? "default" : "outline",
                    size: "lg",
                  }),
                  "mt-6 w-full"
                )}
              >
                {plan.cta}
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
          ))}
        </div>

        <p className="mt-12 text-center text-sm text-muted-foreground">
          All prices in AUD. All plans include AES-256 encryption, Australian data hosting, and no lock-in contracts.
          <br className="hidden sm:block" />
          Your data stays yours — always.
        </p>
      </div>
    </section>
  );
}
