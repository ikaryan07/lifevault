"use client";

import { useState } from "react";
import Link from "next/link";
import { useVault, PLANS, type PlanId, type PlanInfo } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/motion/page-transition";
import {
  Check,
  ArrowLeft,
  Zap,
  Crown,
  Shield,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const planOrder: PlanId[] = ["free", "family", "legacy"];

const planFeatures: Record<PlanId, string[]> = {
  free: [
    "5 shared passwords & logins",
    "5 household info items",
    "5 document uploads",
    "1 trusted contact",
    "Basic planning checklist",
    "AES-256 encryption",
  ],
  family: [
    "Unlimited passwords & logins",
    "Unlimited household info",
    "Unlimited documents",
    "Up to 6 family members",
    "All checklists and guides",
    "Smart reminders",
    "Priority support",
  ],
  legacy: [
    "Everything in Family",
    "10 trusted contacts",
    "Encrypted video & audio messages",
    "Emergency access QR card",
    "Inactivity release trigger",
    "Australian forms library",
    "PDF vault export",
    "Phone support",
  ],
};

const planDescriptions: Record<PlanId, string> = {
  free: "Try it out — no strings attached.",
  family: "Everything your household needs, every day.",
  legacy: "Complete protection for life and beyond.",
};

const planIcons: Record<PlanId, React.ReactNode> = {
  free: <Shield className="h-5 w-5" />,
  family: <Sparkles className="h-5 w-5" />,
  legacy: <Crown className="h-5 w-5" />,
};

function PlanCard({
  planInfo,
  isCurrent,
  isPopular,
  onSelect,
}: {
  planInfo: PlanInfo;
  isCurrent: boolean;
  isPopular: boolean;
  onSelect: () => void;
}) {
  const hasBadge = isPopular || isCurrent;

  return (
    <div className={cn("relative flex flex-col", hasBadge && "mt-3")}>
      {isPopular && !isCurrent && (
        <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 flex items-center gap-1.5 whitespace-nowrap rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow">
          <Zap className="h-3 w-3" />
          Most Popular
        </div>
      )}
      {isCurrent && (
        <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 flex items-center gap-1.5 whitespace-nowrap rounded-full bg-green-600 px-3 py-1 text-xs font-semibold text-white shadow">
          <Check className="h-3 w-3" />
          Current Plan
        </div>
      )}

      <Card
        className={cn(
          "flex flex-1 flex-col overflow-hidden transition-all",
          isPopular && !isCurrent && "border-primary shadow-lg shadow-primary/10 ring-1 ring-primary/20",
          isCurrent && "border-green-500/50 bg-green-500/5"
        )}
      >
        <CardContent className="flex flex-1 flex-col p-6 pt-7">
          <div className="flex items-center gap-2 text-foreground">
            {planIcons[planInfo.id]}
            <h3 className="text-lg font-semibold">{planInfo.name}</h3>
          </div>

          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-3xl font-bold tracking-tight text-foreground">
              {planInfo.price}
            </span>
            <span className="text-sm text-muted-foreground">{planInfo.period}</span>
          </div>

          <p className="mt-2 text-sm text-muted-foreground">
            {planDescriptions[planInfo.id]}
          </p>

          <Button
            onClick={onSelect}
            disabled={isCurrent}
            variant={isCurrent ? "outline" : isPopular ? "default" : "outline"}
            className={cn("mt-5 w-full", isCurrent && "pointer-events-none")}
          >
            {isCurrent ? "Your current plan" : `Switch to ${planInfo.name}`}
          </Button>

          <ul className="mt-6 flex-1 space-y-2.5">
            {planFeatures[planInfo.id].map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 text-sm">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                <span className="text-muted-foreground">{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PlanSettingsPage() {
  const { plan, setPlan } = useVault();
  const [confirmTarget, setConfirmTarget] = useState<PlanId | null>(null);
  const targetPlan = confirmTarget ? PLANS[confirmTarget] : null;

  const isDowngrade =
    confirmTarget !== null &&
    planOrder.indexOf(confirmTarget) < planOrder.indexOf(plan.id);

  function handleConfirm() {
    if (!confirmTarget) return;
    setPlan(confirmTarget);
    const target = PLANS[confirmTarget];
    toast.success(`Switched to ${target.name}`, {
      description:
        confirmTarget === "free"
          ? "You're now on the Free plan."
          : `Your 14-day free trial of ${target.name} has started.`,
    });
    setConfirmTarget(null);
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/settings"
            className="flex h-8 w-8 items-center justify-center rounded-lg border transition-colors hover:bg-muted"
            aria-label="Back to settings"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Manage Plan
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              You&apos;re currently on the{" "}
              <strong className="text-foreground">{plan.name}</strong> plan.
              {plan.id !== "legacy" && " Upgrade anytime to unlock more."}
            </p>
          </div>
        </div>

        <div className="grid items-start gap-6 pt-2 lg:grid-cols-3">
          {planOrder.map((id) => (
            <PlanCard
              key={id}
              planInfo={PLANS[id]}
              isCurrent={plan.id === id}
              isPopular={id === "family"}
              onSelect={() => setConfirmTarget(id)}
            />
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground">
          All plans include AES-256 encryption, Australian data hosting, and no
          lock-in contracts. Cancel anytime.
        </p>

        <Dialog
          open={!!confirmTarget}
          onOpenChange={(open) => !open && setConfirmTarget(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {isDowngrade ? "Downgrade" : "Upgrade"} to {targetPlan?.name}?
              </DialogTitle>
              <DialogDescription>
                {isDowngrade ? (
                  <>
                    Downgrading to <strong>{targetPlan?.name}</strong> will
                    reduce your limits. Any data beyond the new limits will
                    still be saved but you won&apos;t be able to add more until
                    you upgrade again.
                  </>
                ) : confirmTarget === "free" ? null : (
                  <>
                    You&apos;ll start a <strong>14-day free trial</strong> of
                    the {targetPlan?.name} plan at{" "}
                    <strong>
                      {targetPlan?.price}
                      {targetPlan?.period}
                    </strong>
                    . You can cancel anytime before the trial ends.
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setConfirmTarget(null)}>
                Cancel
              </Button>
              <Button
                variant={isDowngrade ? "destructive" : "default"}
                onClick={handleConfirm}
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                {isDowngrade
                  ? `Downgrade to ${targetPlan?.name}`
                  : `Start ${targetPlan?.name} plan`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}
