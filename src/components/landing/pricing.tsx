import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Get started and see if LifeVault is right for you.",
    features: [
      "5 document uploads",
      "1 trusted contact",
      "Basic before-death checklist",
      "Important contacts directory",
      "256-bit encryption",
    ],
    cta: "Get Started",
    href: "/signup",
    highlighted: false,
  },
  {
    name: "Premium",
    price: "$8.99",
    period: "per month",
    description: "Full protection for you and your family.",
    features: [
      "Unlimited documents",
      "5 trusted contacts",
      "All checklists and guides",
      "Australian forms library",
      "Smart reminders",
      "Priority support",
      "Digital asset register",
    ],
    cta: "Start Free Trial",
    href: "/signup?plan=premium",
    highlighted: true,
  },
  {
    name: "Family",
    price: "$14.99",
    period: "per month",
    description: "Cover the whole family. Up to 4 accounts.",
    features: [
      "Everything in Premium",
      "Up to 4 planner accounts",
      "Shared family workspace",
      "Executor task management",
      "Phone support",
    ],
    cta: "Start Free Trial",
    href: "/signup?plan=family",
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
            Start free. Upgrade when you&apos;re ready. Cancel anytime.
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-8 ${
                plan.highlighted
                  ? "border-primary bg-background shadow-xl shadow-primary/10"
                  : "bg-background"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                  Most Popular
                </div>
              )}

              <h3 className="text-lg font-semibold text-foreground">
                {plan.name}
              </h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-foreground">
                  {plan.price}
                </span>
                <span className="text-sm text-muted-foreground">
                  {plan.period}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {plan.description}
              </p>

              <Link
                href={plan.href}
                className={cn(
                  buttonVariants({
                    variant: plan.highlighted ? "default" : "outline",
                  }),
                  "mt-6 w-full"
                )}
              >
                {plan.cta}
              </Link>

              <ul className="mt-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
