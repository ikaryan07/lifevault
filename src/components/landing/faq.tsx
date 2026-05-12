"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "Is my data really secure?",
    a: "Yes. All data is stored on Australian-hosted infrastructure (Supabase + Vercel), protected by AES-256 encryption at rest, TLS in transit, and Row Level Security so only you can access your vault. We never sell or share your information.",
  },
  {
    q: "What happens during the 14-day free trial?",
    a: "You get full access to your chosen plan with no restrictions. No credit card is required to start. If you don't upgrade before the trial ends, you'll be moved to the Free plan — your data stays safe, you just can't add more beyond the free limits.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Absolutely. There are no lock-in contracts. Cancel from your Settings page at any time. Your data remains accessible on the Free plan even after cancellation.",
  },
  {
    q: "Who can access my vault?",
    a: "Only you — unless you explicitly grant access to trusted contacts. Trusted contacts only gain access through a multi-step verification process, and only under the conditions you define (e.g. after prolonged inactivity).",
  },
  {
    q: "What if I forget my password?",
    a: "You can reset your password via email at any time. Your vault data is tied to your account and protected by Supabase Auth — resetting your password doesn't affect your stored documents or contacts.",
  },
  {
    q: "Is this just for end-of-life planning?",
    a: "No! The Family Hub (passwords, household info) is designed for everyday use — sharing WiFi passwords, streaming logins, emergency numbers, and more. The Legacy Vault handles the longer-term planning when you're ready.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left transition-colors hover:text-primary"
        aria-expanded={open}
      >
        <span className="text-sm font-medium text-foreground sm:text-base">{q}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>
      <div
        className={cn(
          "grid transition-all duration-200",
          open ? "grid-rows-[1fr] pb-5 opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <p className="text-sm leading-relaxed text-muted-foreground">{a}</p>
        </div>
      </div>
    </div>
  );
}

export function FAQ() {
  return (
    <section id="faq" className="border-t py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Everything you need to know about LifeVault.
          </p>
        </div>

        <div className="mt-12 divide-y rounded-2xl border bg-card px-6">
          {faqs.map((faq) => (
            <FAQItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </div>
      </div>
    </section>
  );
}
