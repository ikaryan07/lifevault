"use client";

import Link from "next/link";
import { Crown, Lock } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { canUseLegacyFeature, type LegacyFeature } from "@/lib/plans";
import { useVault } from "@/lib/store";
import { cn } from "@/lib/utils";

const featureLabels: Record<LegacyFeature, string> = {
  video_messages: "Video & audio messages",
  emergency_card: "Emergency access card",
  pdf_export: "PDF vault export",
  forms_library: "Australian forms library",
  inactivity_reminders: "Inactivity check-in reminders",
};

export function PlanGate({
  feature,
  children,
  className,
}: {
  feature: LegacyFeature;
  children?: React.ReactNode;
  className?: string;
}) {
  const { plan } = useVault();

  if (canUseLegacyFeature(plan.id, feature)) {
    return children ? <div className={className}>{children}</div> : null;
  }

  return (
    <Card className={cn("border-dashed", className)}>
      <CardHeader className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Lock className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="flex items-center justify-center gap-2">
          <Crown className="h-5 w-5 text-amber-600" />
          Legacy plan feature
        </CardTitle>
        <CardDescription>
          {featureLabels[feature]} is included with the Legacy plan ($12.99/month).
          {plan.id === "family"
            ? " Upgrade from Family to unlock legacy planning tools."
            : " Upgrade to Legacy to unlock this and more."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center pb-8">
        <Link href="/dashboard/settings/plan" className={buttonVariants()}>
          View plans
        </Link>
      </CardContent>
    </Card>
  );
}

export function BillingExplainer({ isOwner }: { isOwner: boolean }) {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="text-base">How family billing works</CardTitle>
        <CardDescription className="text-sm leading-relaxed">
          {isOwner ? (
            <>
              <strong className="text-foreground">You are the family owner</strong> — only you
              pay for Family or Legacy. Everyone you invite creates a free account and
              automatically sees your shared passwords and household info. Legacy planning tools
              (documents, messages, trusted contacts) stay on each person&apos;s own account.
            </>
          ) : (
            <>
              <strong className="text-foreground">You&apos;re a family member</strong> — you
              don&apos;t need to pay. Your family owner manages the subscription. You can view
              and edit everything in the Family Hub (passwords & household info). Ask them to
              upgrade if you need more members or higher limits.
            </>
          )}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

export function TrialBadge({ trialEndsAt }: { trialEndsAt: string | null }) {
  if (!trialEndsAt) return null;
  const end = new Date(trialEndsAt);
  if (end <= new Date()) return null;
  const daysLeft = Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return (
    <span className="inline-flex items-center rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:text-amber-200">
      Trial — {daysLeft} day{daysLeft === 1 ? "" : "s"} left
    </span>
  );
}
