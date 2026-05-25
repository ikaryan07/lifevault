"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useVault, PLANS, type PlanId } from "@/lib/store";
import { PLAN_ORDER } from "@/lib/plans";
import {
  startPlanTrial,
  downgradeToFree,
} from "@/lib/actions/subscription";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageTransition } from "@/components/motion/page-transition";
import {
  BillingExplainer,
  TrialBadge,
} from "@/components/subscription/plan-gate";
import {
  Check,
  ArrowLeft,
  Zap,
  Crown,
  Shield,
  Sparkles,
  ArrowRight,
  CreditCard,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const planIcons: Record<PlanId, React.ReactNode> = {
  free: <Shield className="h-5 w-5" />,
  family: <Sparkles className="h-5 w-5" />,
  legacy: <Crown className="h-5 w-5" />,
};

function PlanCard({
  planId,
  isCurrent,
  isPopular,
  disabled,
  onSelect,
}: {
  planId: PlanId;
  isCurrent: boolean;
  isPopular: boolean;
  disabled: boolean;
  onSelect: () => void;
}) {
  const planInfo = PLANS[planId];
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
          Your family plan
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
            {planIcons[planId]}
            <h3 className="text-lg font-semibold">{planInfo.name}</h3>
          </div>

          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-3xl font-bold tracking-tight text-foreground">
              {planInfo.price}
            </span>
            <span className="text-sm text-muted-foreground">{planInfo.period}</span>
          </div>

          <p className="mt-2 text-sm text-muted-foreground">{planInfo.tagline}</p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {planInfo.billingNote}
          </p>

          <Button
            onClick={onSelect}
            disabled={isCurrent || disabled}
            variant={isCurrent ? "outline" : isPopular ? "default" : "outline"}
            className={cn("mt-5 w-full", isCurrent && "pointer-events-none")}
          >
            {isCurrent
              ? "Current plan"
              : disabled
                ? "Owner manages billing"
                : `Choose ${planInfo.name}`}
          </Button>

          <ul className="mt-6 flex-1 space-y-2.5">
            {planInfo.features.map((feature) => (
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
  const {
    plan,
    refreshSubscription,
    subscriptionLoading,
    isOwner,
    trialEndsAt,
    stripeConfigured,
    cloudMode,
    setPlan,
  } = useVault();
  const searchParams = useSearchParams();
  const [confirmTarget, setConfirmTarget] = useState<PlanId | null>(null);
  const [busy, setBusy] = useState(false);
  const targetPlan = confirmTarget ? PLANS[confirmTarget] : null;

  useEffect(() => {
    const checkout = searchParams.get("checkout");
    if (checkout === "success") {
      toast.success("Subscription updated", {
        description: "Your family plan is now active.",
      });
      refreshSubscription();
    }
  }, [searchParams, refreshSubscription]);

  const isDowngrade =
    confirmTarget !== null &&
    PLAN_ORDER.indexOf(confirmTarget) < PLAN_ORDER.indexOf(plan.id);

  async function startCheckout(planId: PlanId) {
    setBusy(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      toast.error(data.error ?? "Checkout failed");
    } finally {
      setBusy(false);
    }
  }

  async function openPortal() {
    setBusy(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = (await res.json()) as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      toast.error(data.error ?? "Could not open billing portal");
    } finally {
      setBusy(false);
    }
  }

  async function handleConfirm() {
    if (!confirmTarget) return;
    setBusy(true);

    try {
      if (confirmTarget === "free") {
        const result = await downgradeToFree();
        if (result.error) {
          toast.error(result.error);
          return;
        }
        toast.success("Downgraded to Free");
        await refreshSubscription();
        setConfirmTarget(null);
        return;
      }

      if (cloudMode && isOwner) {
        if (stripeConfigured) {
          await startCheckout(confirmTarget);
          return;
        }
        const result = await startPlanTrial(confirmTarget);
        if (result.error) {
          toast.error(result.error);
          return;
        }
        toast.success(`${targetPlan?.name} trial started`, {
          description: "14 days free — no card required until Stripe is connected.",
        });
        await refreshSubscription();
        setConfirmTarget(null);
        return;
      }

      setPlan(confirmTarget);
      toast.success(`Demo mode: switched to ${targetPlan?.name}`);
      setConfirmTarget(null);
    } finally {
      setBusy(false);
    }
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
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">Family plan</h1>
              <TrialBadge trialEndsAt={trialEndsAt} />
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Your household is on{" "}
              <strong className="text-foreground">{plan.name}</strong>
              {subscriptionLoading && " — loading…"}
            </p>
          </div>
        </div>

        <BillingExplainer isOwner={isOwner} />

        {isOwner && stripeConfigured && plan.id !== "free" && (
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={openPortal} disabled={busy}>
              {busy ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CreditCard className="mr-2 h-4 w-4" />
              )}
              Manage billing
            </Button>
          </div>
        )}

        {!isOwner && cloudMode && (
          <p className="rounded-lg border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
            Only your family owner can change the plan or billing. You still get full access to
            shared passwords and household info at no cost.
          </p>
        )}

        <div className="grid items-start gap-6 pt-2 lg:grid-cols-3">
          {PLAN_ORDER.map((id) => (
            <PlanCard
              key={id}
              planId={id}
              isCurrent={plan.id === id}
              isPopular={id === "family"}
              disabled={cloudMode && !isOwner}
              onSelect={() => setConfirmTarget(id)}
            />
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground">
          All prices in AUD. AES-256 encryption and Australian data hosting on every plan.
          {stripeConfigured
            ? " Paid plans bill the family owner only — members join free."
            : " Start a 14-day trial free while payments are being set up."}
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
                    Downgrading reduces limits for your whole family. Existing data stays
                    saved, but you won&apos;t be able to add more until you upgrade again.
                  </>
                ) : confirmTarget === "free" ? (
                  "Your family will move to the Free plan with solo-use limits."
                ) : (
                  <>
                    <strong>{targetPlan?.name}</strong> covers your entire household — one
                    subscription, up to {targetPlan?.limits.familyMembers} members.{" "}
                    {stripeConfigured
                      ? `You'll complete checkout at ${targetPlan?.price}${targetPlan?.period} with a 14-day free trial.`
                      : "You'll get a 14-day free trial. No card required until Stripe is connected."}
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setConfirmTarget(null)} disabled={busy}>
                Cancel
              </Button>
              <Button
                variant={isDowngrade ? "destructive" : "default"}
                onClick={handleConfirm}
                disabled={busy}
              >
                {busy ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="mr-2 h-4 w-4" />
                )}
                {isDowngrade
                  ? `Downgrade to ${targetPlan?.name}`
                  : confirmTarget === "free"
                    ? "Downgrade to Free"
                    : stripeConfigured
                      ? "Continue to checkout"
                      : `Start ${targetPlan?.name} trial`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}
