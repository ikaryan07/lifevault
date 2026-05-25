"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useUser } from "@/lib/auth/hooks";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import {
  fetchFamilyHubBundle,
  saveCredential,
  deleteCredential,
  saveHouseholdItem,
  deleteHouseholdItem,
  type FamilyInfo,
} from "@/lib/actions/family-hub";
import type { SharedCredential, HouseholdItem } from "@/lib/store";
import { toast } from "sonner";

export function useVaultCloud(
  setSharedCredentials: (v: SharedCredential[] | ((p: SharedCredential[]) => SharedCredential[])) => void,
  setHouseholdInfo: (v: HouseholdItem[] | ((p: HouseholdItem[]) => HouseholdItem[])) => void,
  isLocalHydrated: boolean
) {
  const { user, loading: authLoading } = useUser();
  const [family, setFamily] = useState<FamilyInfo | null>(null);
  const [cloudLoading, setCloudLoading] = useState(false);
  const [cloudSynced, setCloudSynced] = useState(false);
  const [cloudSyncError, setCloudSyncError] = useState<string | null>(null);
  const [encryptionReady, setEncryptionReady] = useState(true);
  const initialSyncDoneRef = useRef(false);

  const cloudMode = isSupabaseConfigured() && !!user;

  const refreshCloud = useCallback(async () => {
    if (!cloudMode) return;
    setCloudLoading(true);
    setCloudSyncError(null);
    try {
      const bundle = await fetchFamilyHubBundle();
      if (bundle) {
        setSharedCredentials(bundle.credentials);
        setHouseholdInfo(bundle.household);
        setFamily(bundle.family);
        setEncryptionReady(bundle.encryptionReady);
        if (!bundle.encryptionReady) {
          toast.error("Server encryption is not configured — passwords cannot be saved.");
        }
      }
      setCloudSynced(true);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Cloud sync failed";
      setCloudSyncError(message);
      toast.error(message);
      setCloudSynced(true);
    } finally {
      setCloudLoading(false);
    }
  }, [cloudMode, setSharedCredentials, setHouseholdInfo]);

  useEffect(() => {
    if (!isLocalHydrated || authLoading) return;
    if (!cloudMode) {
      setCloudSynced(true);
      return;
    }
    if (initialSyncDoneRef.current) return;
    initialSyncDoneRef.current = true;
    refreshCloud();
  }, [cloudMode, isLocalHydrated, authLoading, refreshCloud]);

  const upsertCredential = useCallback(
    async (entry: SharedCredential, isNew: boolean) => {
      if (!cloudMode) return { entry };
      const result = await saveCredential(entry, isNew);
      if ("error" in result && result.error) return { error: result.error };
      if (!("id" in result)) return { error: "Save failed" };
      const saved: SharedCredential = {
        ...entry,
        id: result.id ?? entry.id,
        updatedAt: result.updatedAt ?? entry.updatedAt,
      };
      return { entry: saved };
    },
    [cloudMode]
  );

  const removeCredential = useCallback(
    async (id: string) => {
      if (!cloudMode) return { success: true };
      return deleteCredential(id);
    },
    [cloudMode]
  );

  const upsertHousehold = useCallback(
    async (item: HouseholdItem, isNew: boolean) => {
      if (!cloudMode) return { item };
      const result = await saveHouseholdItem(item, isNew);
      if ("error" in result && result.error) return { error: result.error };
      if (!("id" in result)) return { error: "Save failed" };
      const saved: HouseholdItem = {
        ...item,
        id: result.id ?? item.id,
        updatedAt: result.updatedAt ?? item.updatedAt,
      };
      return { item: saved };
    },
    [cloudMode]
  );

  const removeHousehold = useCallback(
    async (id: string) => {
      if (!cloudMode) return { success: true };
      return deleteHouseholdItem(id);
    },
    [cloudMode]
  );

  return {
    cloudMode,
    cloudLoading,
    cloudSynced,
    cloudSyncError,
    encryptionReady,
    family,
    refreshCloud,
    upsertCredential,
    removeCredential,
    upsertHousehold,
    removeHousehold,
  };
}
