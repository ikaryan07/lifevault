"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useUser } from "@/lib/auth/hooks";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import {
  fetchLegacyVaultData,
  migrateLocalLegacyToCloud,
  deleteTrustedContact,
  deleteImportantContact,
  saveImportantContact,
  deleteDigitalAsset,
  saveDigitalAsset,
  syncChecklistItem,
  saveDocumentRecord,
  deleteDocumentRecord,
} from "@/lib/actions/legacy-vault";
import type {
  StoredDocument,
  StoredDigitalAsset,
  StoredChecklistState,
} from "@/lib/store";
import type { TrustedContact, ImportantContact } from "@/types";

type LocalSnapshot = {
  trustedContacts: TrustedContact[];
  importantContacts: ImportantContact[];
  digitalAssets: StoredDigitalAsset[];
  documents: StoredDocument[];
  checklist: StoredChecklistState;
};

export function useLegacyCloud(
  setters: {
    setTrustedContacts: (v: TrustedContact[] | ((p: TrustedContact[]) => TrustedContact[])) => void;
    setImportantContacts: (v: ImportantContact[] | ((p: ImportantContact[]) => ImportantContact[])) => void;
    setDigitalAssets: (v: StoredDigitalAsset[] | ((p: StoredDigitalAsset[]) => StoredDigitalAsset[])) => void;
    setDocuments: (v: StoredDocument[] | ((p: StoredDocument[]) => StoredDocument[])) => void;
    setChecklist: (v: StoredChecklistState | ((p: StoredChecklistState) => StoredChecklistState)) => void;
  },
  localSnapshot: LocalSnapshot,
  isLocalHydrated: boolean,
  familyCloudSynced: boolean
) {
  const { user, loading: authLoading } = useUser();
  const [legacySynced, setLegacySynced] = useState(false);
  const localRef = useRef(localSnapshot);
  localRef.current = localSnapshot;
  const migratedRef = useRef(false);

  const cloudMode = isSupabaseConfigured() && !!user;

  const refreshLegacy = useCallback(async () => {
    if (!cloudMode) return;

    try {
      if (!migratedRef.current) {
        await migrateLocalLegacyToCloud(localRef.current);
        migratedRef.current = true;
      }
      const data = await fetchLegacyVaultData();
      if (data) {
        setters.setTrustedContacts(data.trustedContacts);
        setters.setImportantContacts(data.importantContacts);
        setters.setDigitalAssets(data.digitalAssets);
        setters.setDocuments(data.documents);
        setters.setChecklist(data.checklist);
      }
    } catch (e) {
      console.error("Legacy cloud sync failed:", e);
    } finally {
      setLegacySynced(true);
    }
  }, [cloudMode, setters]);

  useEffect(() => {
    if (!isLocalHydrated || authLoading) return;
    if (!cloudMode) {
      setLegacySynced(true);
      return;
    }
    if (familyCloudSynced) {
      refreshLegacy();
    }
  }, [cloudMode, isLocalHydrated, authLoading, familyCloudSynced, refreshLegacy]);

  const removeTrusted = useCallback(
    async (id: string) => {
      if (!cloudMode) return { success: true };
      return deleteTrustedContact(id);
    },
    [cloudMode]
  );

  const upsertImportant = useCallback(
    async (contact: ImportantContact, isNew: boolean) => {
      if (!cloudMode) return { contact };
      return saveImportantContact(contact, isNew);
    },
    [cloudMode]
  );

  const removeImportant = useCallback(
    async (id: string) => {
      if (!cloudMode) return { success: true };
      return deleteImportantContact(id);
    },
    [cloudMode]
  );

  const upsertDigital = useCallback(
    async (asset: StoredDigitalAsset, isNew: boolean) => {
      if (!cloudMode) return { asset };
      return saveDigitalAsset(asset, isNew);
    },
    [cloudMode]
  );

  const removeDigital = useCallback(
    async (id: string) => {
      if (!cloudMode) return { success: true };
      return deleteDigitalAsset(id);
    },
    [cloudMode]
  );

  const toggleChecklist = useCallback(
    async (listType: "before" | "after", itemId: string, completed: boolean) => {
      if (!cloudMode) return {};
      return syncChecklistItem(listType, itemId, completed);
    },
    [cloudMode]
  );

  const upsertDocument = useCallback(
    async (doc: StoredDocument, encryptionKey?: string) => {
      if (!cloudMode) return { document: doc };
      return saveDocumentRecord(doc, encryptionKey);
    },
    [cloudMode]
  );

  const removeDocument = useCallback(
    async (id: string, filePath?: string) => {
      if (!cloudMode) return { success: true };
      return deleteDocumentRecord(id, filePath);
    },
    [cloudMode]
  );

  return {
    legacySynced,
    refreshLegacy,
    removeTrusted,
    upsertImportant,
    removeImportant,
    upsertDigital,
    removeDigital,
    toggleChecklist,
    upsertDocument,
    removeDocument,
  };
}
