"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useUser } from "@/lib/auth/hooks";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import {
  fetchFamilyHubData,
  getFamilyInfo,
  saveCredential,
  deleteCredential,
  saveHouseholdItem,
  deleteHouseholdItem,
  type FamilyInfo,
} from "@/lib/actions/family-hub";
import type { SharedCredential, HouseholdItem } from "@/lib/store";

export function useVaultCloud(
  setSharedCredentials: (v: SharedCredential[] | ((p: SharedCredential[]) => SharedCredential[])) => void,
  setHouseholdInfo: (v: HouseholdItem[] | ((p: HouseholdItem[]) => HouseholdItem[])) => void,
  isLocalHydrated: boolean
) {
  const { user, loading: authLoading } = useUser();
  const [family, setFamily] = useState<FamilyInfo | null>(null);
  const [cloudLoading, setCloudLoading] = useState(false);
  const [cloudSynced, setCloudSynced] = useState(false);
  const initialSyncDoneRef = useRef(false);

  const cloudMode = isSupabaseConfigured() && !!user;

  const refreshCloud = useCallback(async () => {
    if (!cloudMode) return;
    setCloudLoading(true);
    try {
      const [hub, fam] = await Promise.all([fetchFamilyHubData(), getFamilyInfo()]);
      if (hub) {
        setSharedCredentials(hub.credentials);
        setHouseholdInfo(hub.household);
      }
      setFamily(fam.family);
      setCloudSynced(true);
    } catch (e) {
      console.error("Cloud sync failed:", e);
    } finally {
      setCloudLoading(false);
      setCloudSynced(true);
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
    family,
    refreshCloud,
    upsertCredential,
    removeCredential,
    upsertHousehold,
    removeHousehold,
  };
}
