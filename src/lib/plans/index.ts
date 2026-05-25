export type PlanId = "free" | "family" | "legacy";

export type PlanLimitKey =
  | "passwords"
  | "household"
  | "documents"
  | "trustedContacts"
  | "familyMembers";

export interface PlanLimits {
  passwords: number;
  household: number;
  documents: number;
  trustedContacts: number;
  familyMembers: number;
}

export interface PlanInfo {
  id: PlanId;
  name: string;
  price: string;
  period: string;
  tagline: string;
  limits: PlanLimits;
  features: string[];
  /** Who pays — Family Hub is one subscription per household. */
  billingNote: string;
}

export const PLAN_ORDER: PlanId[] = ["free", "family", "legacy"];

export const TRIAL_DAYS = 14;

export const PLANS: Record<PlanId, PlanInfo> = {
  free: {
    id: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    tagline: "Try it out on your own.",
    billingNote: "One person only. Family sharing requires Family or Legacy.",
    limits: {
      passwords: 5,
      household: 5,
      documents: 5,
      trustedContacts: 1,
      familyMembers: 1,
    },
    features: [
      "5 shared passwords & logins",
      "5 household info items",
      "5 document uploads",
      "1 trusted contact",
      "Basic planning checklist",
      "AES-256 encryption",
    ],
  },
  family: {
    id: "family",
    name: "Family",
    price: "$6.99",
    period: "/month",
    tagline: "One subscription covers your whole household.",
    billingNote:
      "The family owner pays. Everyone they invite joins free and sees the same shared passwords & household info.",
    limits: {
      passwords: Infinity,
      household: Infinity,
      documents: Infinity,
      trustedContacts: 3,
      familyMembers: 6,
    },
    features: [
      "Unlimited shared passwords & logins",
      "Unlimited household info",
      "Unlimited documents",
      "Up to 6 family members (owner pays, members join free)",
      "3 trusted contacts",
      "All checklists and guides",
      "Email support",
    ],
  },
  legacy: {
    id: "legacy",
    name: "Legacy",
    price: "$12.99",
    period: "/month",
    tagline: "Family sharing plus full legacy planning.",
    billingNote:
      "The family owner pays. Members get shared Family Hub access; legacy tools are for the account holder.",
    limits: {
      passwords: Infinity,
      household: Infinity,
      documents: Infinity,
      trustedContacts: 10,
      familyMembers: 6,
    },
    features: [
      "Everything in Family",
      "10 trusted contacts",
      "Video & audio messages",
      "Emergency access QR card",
      "Inactivity check-in reminders",
      "Australian forms & resources",
      "PDF vault export",
      "Priority email support",
    ],
  },
};

export type LegacyFeature =
  | "video_messages"
  | "emergency_card"
  | "pdf_export"
  | "forms_library"
  | "inactivity_reminders";

const LEGACY_FEATURES: LegacyFeature[] = [
  "video_messages",
  "emergency_card",
  "pdf_export",
  "forms_library",
  "inactivity_reminders",
];

export function getPlan(id: PlanId | string | null | undefined): PlanInfo {
  if (id && id in PLANS) return PLANS[id as PlanId];
  return PLANS.free;
}

export function formatLimit(value: number): string {
  return Number.isFinite(value) ? String(value) : "Unlimited";
}

export function isAtLimit(current: number, limit: number): boolean {
  return Number.isFinite(limit) && current >= limit;
}

export function hasLegacyAccess(planId: PlanId): boolean {
  return planId === "legacy";
}

export function canUseLegacyFeature(planId: PlanId, feature: LegacyFeature): boolean {
  return hasLegacyAccess(planId) && LEGACY_FEATURES.includes(feature);
}

export function planRank(id: PlanId): number {
  return PLAN_ORDER.indexOf(id);
}

export function isUpgrade(from: PlanId, to: PlanId): boolean {
  return planRank(to) > planRank(from);
}

export function planSummary(planId: PlanId): string {
  const plan = getPlan(planId);
  if (planId === "free") {
    return `${plan.limits.passwords} passwords, ${plan.limits.household} household items, ${plan.limits.documents} documents, ${plan.limits.trustedContacts} trusted contact. Solo use only.`;
  }
  if (planId === "family") {
    return "Unlimited shared passwords & household info. Up to 6 family members. Owner pays — members join free.";
  }
  return "Everything in Family, plus legacy planning tools, 10 trusted contacts, and PDF export.";
}
