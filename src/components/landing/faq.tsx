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
    q: "Who pays for a Family subscription?",
    a: "Only the family owner pays. When they upgrade to Family ($6.99/month) or Legacy ($12.99/month), everyone they invite joins free and automatically sees the same shared passwords and household info. Legacy planning tools (documents, messages, trusted contacts) stay on each person's own account.",
  },
  {
    q: "What happens during the 14-day free trial?",
    a: "The family owner gets full access to the chosen plan for 14 days. No credit card is required until Stripe payments are connected. When the trial ends, the family moves to the Free plan — your data stays safe, but you can't add more beyond free limits until you upgrade again.",
  },
  {
    q: "Can I pay annually?",
    a: "Yes. Family is $69/year and Legacy is $129/year — that's 2 months free compared to paying monthly. The family owner pays once per year; everyone they invite still joins free.",
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
            Everything you need to know about HomePin.
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
