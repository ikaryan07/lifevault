"use client";

import { createContext, useContext, useCallback, useMemo, ReactNode, useEffect } from "react";
import { useLocalStorage } from "@/lib/hooks/use-local-storage";
import { migrateLegacyStorageKeys, storageKeys } from "@/lib/storage-keys";
import { useVaultCloud } from "@/lib/hooks/use-vault-cloud";
import { useLegacyCloud } from "@/lib/hooks/use-legacy-cloud";
import { useUser } from "@/lib/auth/hooks";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { syncSupabaseProfileToStorage } from "@/lib/auth/sync-profile";
import type { FamilyInfo } from "@/lib/actions/family-hub";
import type { DocumentCategory, TrustedContact, ImportantContact } from "@/types";
import {
  getPlan,
  PLANS,
  type PlanId,
  type PlanInfo,
} from "@/lib/plans";
import { useSubscription } from "@/lib/hooks/use-subscription";

export type { PlanId, PlanInfo };
export { PLANS, getPlan };

export interface StoredDocument {
  id: string;
  title: string;
  category: DocumentCategory;
  fileName: string;
  fileSize: number;
  mimeType?: string;
  hasFile?: boolean;
  notes?: string;
  uploadedAt: string;
  filePath?: string;
  encryptionIv?: string;
  encryptionKey?: string;
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
  refreshSubscription: () => Promise<void>;
  subscriptionLoading: boolean;
  isOwner: boolean;
  trialEndsAt: string | null;
  stripeConfigured: boolean;
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
  cloudMode: boolean;
  cloudLoading: boolean;
  family: FamilyInfo | null;
  refreshCloud: () => Promise<void>;
  upsertCredential: (
    entry: SharedCredential,
    isNew: boolean
  ) => Promise<{ entry?: SharedCredential; error?: string }>;
  removeCredential: (id: string) => Promise<{ error?: string; success?: boolean }>;
  upsertHousehold: (
    item: HouseholdItem,
    isNew: boolean
  ) => Promise<{ item?: HouseholdItem; error?: string }>;
  removeHousehold: (id: string) => Promise<{ error?: string; success?: boolean }>;
  removeTrustedContact: (id: string) => Promise<{ error?: string; success?: boolean }>;
  upsertImportantContact: (
    contact: ImportantContact,
    isNew: boolean
  ) => Promise<{ contact?: ImportantContact; error?: string }>;
  removeImportantContact: (id: string) => Promise<{ error?: string; success?: boolean }>;
  upsertDigitalAsset: (
    asset: StoredDigitalAsset,
    isNew: boolean
  ) => Promise<{ asset?: StoredDigitalAsset; error?: string }>;
  removeDigitalAsset: (id: string) => Promise<{ error?: string; success?: boolean }>;
  toggleChecklistItem: (
    listType: "before" | "after",
    itemId: string,
    completed: boolean
  ) => Promise<{ error?: string }>;
  upsertDocument: (
    doc: StoredDocument,
    encryptionKey?: string
  ) => Promise<{ document?: StoredDocument; error?: string }>;
  removeDocument: (
    id: string,
    filePath?: string
  ) => Promise<{ error?: string; success?: boolean }>;
}

const VaultContext = createContext<VaultStore | null>(null);

export function VaultProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    migrateLegacyStorageKeys();
  }, []);

  const [profile, setProfile, h1] = useLocalStorage<UserProfile | null>(
    storageKeys.profile,
    null
  );
  const [planId, setPlanIdRaw, h0] = useLocalStorage<PlanId>(
    storageKeys.plan,
    "free"
  );
  const [documents, setDocuments, h2] = useLocalStorage<StoredDocument[]>(
    storageKeys.documents,
    []
  );
  const [trustedContacts, setTrustedContacts, h3] = useLocalStorage<TrustedContact[]>(
    storageKeys.trustedContacts,
    []
  );
  const [importantContacts, setImportantContacts, h4] = useLocalStorage<ImportantContact[]>(
    storageKeys.importantContacts,
    []
  );
  const [digitalAssets, setDigitalAssets, h5] = useLocalStorage<StoredDigitalAsset[]>(
    storageKeys.digitalAssets,
    []
  );
  const [checklist, setChecklist, h6] = useLocalStorage<StoredChecklistState>(
    storageKeys.checklist,
    { before: {}, after: {} }
  );
  const [sharedCredentials, setSharedCredentials, h7] = useLocalStorage<SharedCredential[]>(
    storageKeys.sharedCredentials,
    []
  );
  const [householdInfo, setHouseholdInfo, h8] = useLocalStorage<HouseholdItem[]>(
    storageKeys.householdInfo,
    []
  );

  const subscription = useSubscription(planId);
  const { user } = useUser();
  const cloudModeForPlan = isSupabaseConfigured() && !!user;
  const plan = cloudModeForPlan ? subscription.plan : getPlan(planId);
  const setPlan = useCallback((id: PlanId) => setPlanIdRaw(id), [setPlanIdRaw]);

  useEffect(() => {
    if (!user || !isSupabaseConfigured()) return;
    const synced = syncSupabaseProfileToStorage(user, profile);
    setProfile(synced);
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const localHydrated = h0 && h1 && h2 && h3 && h4 && h5 && h6 && h7 && h8;

  const {
    cloudMode,
    cloudLoading,
    cloudSynced,
    family,
    refreshCloud,
    upsertCredential,
    removeCredential,
    upsertHousehold,
    removeHousehold,
  } = useVaultCloud(setSharedCredentials, setHouseholdInfo, localHydrated);

  const legacyCloud = useLegacyCloud(
    {
      setTrustedContacts,
      setImportantContacts,
      setDigitalAssets,
      setDocuments,
      setChecklist,
    },
    { trustedContacts, importantContacts, digitalAssets, documents, checklist },
    localHydrated,
    cloudMode ? cloudSynced : true
  );

  const isHydrated = localHydrated && (cloudMode ? cloudSynced && legacyCloud.legacySynced : true);

  const value = useMemo(
    () => ({
      profile,
      setProfile,
      plan,
      setPlan,
      refreshSubscription: subscription.refresh,
      subscriptionLoading: subscription.loading,
      isOwner: subscription.isOwner,
      trialEndsAt: subscription.trialEndsAt,
      stripeConfigured: subscription.stripeConfigured,
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
      cloudMode,
      cloudLoading,
      family,
      refreshCloud,
      upsertCredential,
      removeCredential,
      upsertHousehold,
      removeHousehold,
      removeTrustedContact: legacyCloud.removeTrusted,
      upsertImportantContact: legacyCloud.upsertImportant,
      removeImportantContact: legacyCloud.removeImportant,
      upsertDigitalAsset: legacyCloud.upsertDigital,
      removeDigitalAsset: legacyCloud.removeDigital,
      toggleChecklistItem: legacyCloud.toggleChecklist,
      upsertDocument: legacyCloud.upsertDocument,
      removeDocument: legacyCloud.removeDocument,
    }),
    [
      profile, setProfile, plan, setPlan, subscription,
      documents, setDocuments, trustedContacts, setTrustedContacts,
      importantContacts, setImportantContacts, digitalAssets, setDigitalAssets,
      checklist, setChecklist, sharedCredentials, setSharedCredentials,
      householdInfo, setHouseholdInfo, isHydrated,
      cloudMode, cloudLoading, family, refreshCloud,
      upsertCredential, removeCredential, upsertHousehold, removeHousehold,
      legacyCloud,
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
