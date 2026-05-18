"use client";

import { createContext, useContext, useCallback, useMemo, ReactNode } from "react";
import { useLocalStorage } from "@/lib/hooks/use-local-storage";
import type { DocumentCategory, TrustedContact, ImportantContact } from "@/types";

export interface StoredDocument {
  id: string;
  title: string;
  category: DocumentCategory;
  fileName: string;
  fileSize: number;
  notes?: string;
  uploadedAt: string;
}

export interface StoredDigitalAsset {
  id: string;
  name: string;
  type: string;
  url: string;
  username: string;
  action: "close" | "memorialize" | "transfer" | "keep";
  notes: string;
}

export interface StoredChecklistState {
  before: Record<string, boolean>;
  after: Record<string, boolean>;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
}

export type PlanId = "free" | "family" | "legacy";

export interface PlanInfo {
  id: PlanId;
  name: string;
  price: string;
  period: string;
  limits: {
    passwords: number;
    household: number;
    documents: number;
    trustedContacts: number;
    familyMembers: number;
  };
}

export const PLANS: Record<PlanId, PlanInfo> = {
  free: {
    id: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    limits: { passwords: 5, household: 5, documents: 5, trustedContacts: 1, familyMembers: 1 },
  },
  family: {
    id: "family",
    name: "Family",
    price: "$6.99",
    period: "/month",
    limits: { passwords: Infinity, household: Infinity, documents: Infinity, trustedContacts: 3, familyMembers: 6 },
  },
  legacy: {
    id: "legacy",
    name: "Legacy",
    price: "$12.99",
    period: "/month",
    limits: { passwords: Infinity, household: Infinity, documents: Infinity, trustedContacts: 10, familyMembers: 6 },
  },
};

export type CredentialCategory =
  | "wifi"
  | "streaming"
  | "utilities"
  | "insurance"
  | "banking"
  | "social"
  | "shopping"
  | "other";

export const CREDENTIAL_CATEGORIES: Record<CredentialCategory, { label: string; icon: string }> = {
  wifi: { label: "WiFi & Internet", icon: "Wifi" },
  streaming: { label: "Streaming & Entertainment", icon: "Tv" },
  utilities: { label: "Utilities & Bills", icon: "Zap" },
  insurance: { label: "Insurance", icon: "ShieldCheck" },
  banking: { label: "Banking & Finance", icon: "Landmark" },
  social: { label: "Social Media", icon: "MessageCircle" },
  shopping: { label: "Shopping & Deliveries", icon: "ShoppingBag" },
  other: { label: "Other", icon: "Key" },
};

export interface SharedCredential {
  id: string;
  category: CredentialCategory;
  name: string;
  username?: string;
  password?: string;
  url?: string;
  pin?: string;
  notes?: string;
  updatedAt: string;
}

export type HouseholdCategory =
  | "address"
  | "emergency"
  | "utility"
  | "medical"
  | "school"
  | "membership"
  | "vehicle"
  | "other";

export const HOUSEHOLD_CATEGORIES: Record<HouseholdCategory, { label: string; icon: string }> = {
  address: { label: "Home & Address", icon: "Home" },
  emergency: { label: "Emergency Numbers", icon: "Phone" },
  utility: { label: "Utility Providers", icon: "Zap" },
  medical: { label: "Medical & Health", icon: "Heart" },
  school: { label: "School & Childcare", icon: "GraduationCap" },
  membership: { label: "Memberships & Clubs", icon: "Award" },
  vehicle: { label: "Vehicles", icon: "Car" },
  other: { label: "Other", icon: "FileText" },
};

export interface HouseholdItem {
  id: string;
  category: HouseholdCategory;
  label: string;
  value: string;
  notes?: string;
  updatedAt: string;
}

type Setter<T> = (v: T | ((prev: T) => T)) => void;

interface VaultStore {
  profile: UserProfile | null;
  setProfile: (p: UserProfile | null) => void;
  plan: PlanInfo;
  setPlan: (id: PlanId) => void;
  documents: StoredDocument[];
  setDocuments: Setter<StoredDocument[]>;
  trustedContacts: TrustedContact[];
  setTrustedContacts: Setter<TrustedContact[]>;
  importantContacts: ImportantContact[];
  setImportantContacts: Setter<ImportantContact[]>;
  digitalAssets: StoredDigitalAsset[];
  setDigitalAssets: Setter<StoredDigitalAsset[]>;
  checklist: StoredChecklistState;
  setChecklist: Setter<StoredChecklistState>;
  sharedCredentials: SharedCredential[];
  setSharedCredentials: Setter<SharedCredential[]>;
  householdInfo: HouseholdItem[];
  setHouseholdInfo: Setter<HouseholdItem[]>;
  isHydrated: boolean;
}

const VaultContext = createContext<VaultStore | null>(null);

export function VaultProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile, h1] = useLocalStorage<UserProfile | null>(
    "HomePin:profile",
    null
  );
  const [planId, setPlanIdRaw, h0] = useLocalStorage<PlanId>(
    "HomePin:plan",
    "free"
  );
  const [documents, setDocuments, h2] = useLocalStorage<StoredDocument[]>(
    "HomePin:documents",
    []
  );
  const [trustedContacts, setTrustedContacts, h3] = useLocalStorage<TrustedContact[]>(
    "HomePin:trusted-contacts",
    []
  );
  const [importantContacts, setImportantContacts, h4] = useLocalStorage<ImportantContact[]>(
    "HomePin:important-contacts",
    []
  );
  const [digitalAssets, setDigitalAssets, h5] = useLocalStorage<StoredDigitalAsset[]>(
    "HomePin:digital-assets",
    []
  );
  const [checklist, setChecklist, h6] = useLocalStorage<StoredChecklistState>(
    "HomePin:checklist",
    { before: {}, after: {} }
  );
  const [sharedCredentials, setSharedCredentials, h7] = useLocalStorage<SharedCredential[]>(
    "HomePin:shared-credentials",
    []
  );
  const [householdInfo, setHouseholdInfo, h8] = useLocalStorage<HouseholdItem[]>(
    "HomePin:household-info",
    []
  );

  const plan = PLANS[planId] ?? PLANS.free;
  const setPlan = useCallback((id: PlanId) => setPlanIdRaw(id), [setPlanIdRaw]);

  const isHydrated = h0 && h1 && h2 && h3 && h4 && h5 && h6 && h7 && h8;

  const value = useMemo(
    () => ({
      profile,
      setProfile,
      plan,
      setPlan,
      documents,
      setDocuments,
      trustedContacts,
      setTrustedContacts,
      importantContacts,
      setImportantContacts,
      digitalAssets,
      setDigitalAssets,
      checklist,
      setChecklist,
      sharedCredentials,
      setSharedCredentials,
      householdInfo,
      setHouseholdInfo,
      isHydrated,
    }),
    [
      profile, setProfile, plan, setPlan,
      documents, setDocuments, trustedContacts, setTrustedContacts,
      importantContacts, setImportantContacts, digitalAssets, setDigitalAssets,
      checklist, setChecklist, sharedCredentials, setSharedCredentials,
      householdInfo, setHouseholdInfo, isHydrated,
    ]
  );

  return (
    <VaultContext.Provider value={value}>
      {children}
    </VaultContext.Provider>
  );
}

export function useVault() {
  const context = useContext(VaultContext);
  if (!context) {
    throw new Error("useVault must be used within a VaultProvider");
  }
  return context;
}
