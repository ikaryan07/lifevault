"use client";

import { useVault } from "@/lib/store";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle } from "lucide-react";

const steps = [
  {
    id: "wifi",
    label: "Add your WiFi password",
    href: "/dashboard/family/passwords",
    check: (v: ReturnType<typeof useVault>) =>
      v.sharedCredentials.some((c) => c.category === "wifi"),
  },
  {
    id: "streaming",
    label: "Save a streaming login",
    href: "/dashboard/family/passwords",
    check: (v: ReturnType<typeof useVault>) =>
      v.sharedCredentials.some((c) => c.category === "streaming"),
  },
  {
    id: "emergency",
    label: "Add an emergency number",
    href: "/dashboard/family/household",
    check: (v: ReturnType<typeof useVault>) =>
      v.householdInfo.some((h) => h.category === "emergency" || h.category === "medical"),
  },
  {
    id: "family",
    label: "Invite your family",
    href: "/dashboard/family/members",
    check: (v: ReturnType<typeof useVault>) =>
      (v.family?.members.length ?? 0) > 1 || v.trustedContacts.length > 0,
  },
  {
    id: "legacy",
    label: "Start your legacy checklist",
    href: "/dashboard/checklist",
    check: (v: ReturnType<typeof useVault>) =>
      v.documents.length > 0 ||
      Object.values(v.checklist.before).some(Boolean) ||
      Object.values(v.checklist.after).some(Boolean),
  },
];

export function FamilySetupProgress() {
  const vault = useVault();
  const completed = steps.filter((s) => s.check(vault)).length;
  const percent = Math.round((completed / steps.length) * 100);

  if (!vault.isHydrated || percent === 100) return null;

  return (
    <div className="mb-6 rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-foreground">Family setup</p>
          <p className="text-xs text-muted-foreground">
            {completed} of {steps.length} steps — about 10 minutes to get fully set up
          </p>
        </div>
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
          {percent}%
        </div>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>

      <ul className="mt-4 space-y-2">
        {steps.map((step) => {
          const done = step.check(vault);
          return (
            <li key={step.id}>
              <Link
                href={step.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-muted/60",
                  done ? "text-muted-foreground" : "text-foreground"
                )}
              >
                {done ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
                ) : (
                  <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
                <span className={done ? "line-through" : ""}>{step.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
