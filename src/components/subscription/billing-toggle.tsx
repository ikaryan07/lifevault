"use client";

import { cn } from "@/lib/utils";
import type { BillingInterval } from "@/lib/plans";

export function BillingToggle({
  value,
  onChange,
  className,
}: {
  value: BillingInterval;
  onChange: (interval: BillingInterval) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border bg-muted/50 p-1 text-sm",
        className
      )}
      role="group"
      aria-label="Billing interval"
    >
      <button
        type="button"
        onClick={() => onChange("monthly")}
        className={cn(
          "rounded-full px-4 py-1.5 font-medium transition-colors",
          value === "monthly"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
        aria-pressed={value === "monthly"}
      >
        Monthly
      </button>
      <button
        type="button"
        onClick={() => onChange("annual")}
        className={cn(
          "rounded-full px-4 py-1.5 font-medium transition-colors",
          value === "annual"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
        aria-pressed={value === "annual"}
      >
        Annual
        <span className="ml-1.5 text-xs font-semibold text-green-600 dark:text-green-400">
          Save 2 mo
        </span>
      </button>
    </div>
  );
}
