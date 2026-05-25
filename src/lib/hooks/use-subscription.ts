"use client";

import { useCallback, useEffect, useState } from "react";
import { getSubscriptionStatus, type SubscriptionStatus } from "@/lib/actions/subscription";
import { getPlan, PLANS, type PlanId, type PlanInfo } from "@/lib/plans";
import { useUser } from "@/lib/auth/hooks";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export type SubscriptionState = {
  loading: boolean;
  plan: PlanInfo;
  planId: PlanId;
  isOwner: boolean;
  memberCount: number;
  trialEndsAt: string | null;
  subscriptionStatus: string;
  stripeConfigured: boolean;
  cloudEnabled: boolean;
  refresh: () => Promise<void>;
};

export function useSubscription(localPlanId: PlanId): SubscriptionState {
  const { user, loading: authLoading } = useUser();
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<PlanInfo>(PLANS.free);
  const [planId, setPlanId] = useState<PlanId>("free");
  const [isOwner, setIsOwner] = useState(true);
  const [memberCount, setMemberCount] = useState(1);
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState("none");
  const [stripeConfigured, setStripeConfigured] = useState(false);
  const [cloudEnabled, setCloudEnabled] = useState(false);

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured() || !user) {
      setLoading(false);
      setPlan(getPlan(localPlanId));
      setPlanId(localPlanId);
      setCloudEnabled(isSupabaseConfigured());
      return;
    }

    setLoading(true);
    try {
      const status: SubscriptionStatus = await getSubscriptionStatus();
      setCloudEnabled(status.cloudEnabled);
      setStripeConfigured(status.stripeConfigured);

      if (status.authenticated) {
        setPlan(status.plan);
        setPlanId(status.planId);
        setIsOwner(status.isOwner);
        setMemberCount(status.memberCount);
        setTrialEndsAt(status.trialEndsAt);
        setSubscriptionStatus(status.subscriptionStatus);
      } else {
        setPlan(getPlan(localPlanId));
        setPlanId(localPlanId);
      }
    } catch {
      setPlan(getPlan(localPlanId));
      setPlanId(localPlanId);
      setCloudEnabled(isSupabaseConfigured());
    } finally {
      setLoading(false);
    }
  }, [user, localPlanId]);

  useEffect(() => {
    if (authLoading) return;
    refresh();
  }, [authLoading, refresh]);

  return {
    loading,
    plan,
    planId,
    isOwner,
    memberCount,
    trialEndsAt,
    subscriptionStatus,
    stripeConfigured,
    cloudEnabled,
    refresh,
  };
}
