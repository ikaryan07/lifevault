/** All client-side localStorage keys use this prefix (lowercase). */
export const STORAGE_PREFIX = "homepin";

export const storageKeys = {
  profile: `${STORAGE_PREFIX}:profile`,
  plan: `${STORAGE_PREFIX}:plan`,
  documents: `${STORAGE_PREFIX}:documents`,
  trustedContacts: `${STORAGE_PREFIX}:trusted-contacts`,
  importantContacts: `${STORAGE_PREFIX}:important-contacts`,
  digitalAssets: `${STORAGE_PREFIX}:digital-assets`,
  checklist: `${STORAGE_PREFIX}:checklist`,
  sharedCredentials: `${STORAGE_PREFIX}:shared-credentials`,
  householdInfo: `${STORAGE_PREFIX}:household-info`,
  messages: `${STORAGE_PREFIX}:messages`,
  welcomeComplete: `${STORAGE_PREFIX}:welcome-complete`,
  demoSession: `${STORAGE_PREFIX}:demo-session`,
  theme: `${STORAGE_PREFIX}:theme`,
  accessibility: `${STORAGE_PREFIX}:accessibility`,
  notifications: `${STORAGE_PREFIX}:notifications`,
  checkinDays: `${STORAGE_PREFIX}:checkin-days`,
  locale: `${STORAGE_PREFIX}:locale`,
  pwaDismissed: `${STORAGE_PREFIX}:pwa-dismissed`,
} as const;

/** Keys kept on sign-out (preferences only). */
export const PRESERVED_ON_SIGN_OUT = new Set<string>([
  storageKeys.welcomeComplete,
  storageKeys.theme,
  storageKeys.accessibility,
  storageKeys.locale,
  storageKeys.pwaDismissed,
  "HomePin:welcome-complete",
  "HomePin:theme",
  "HomePin:accessibility",
  "HomePin:locale",
  "HomePin:pwa-dismissed",
]);

/** Remove user vault data from localStorage (keeps UI preferences). */
export function clearUserVaultData() {
  if (typeof window === "undefined") return;

  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    const isHomepinKey =
      key.startsWith(`${STORAGE_PREFIX}:`) || key.startsWith("HomePin:");
    if (isHomepinKey && !PRESERVED_ON_SIGN_OUT.has(key)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((key) => localStorage.removeItem(key));
}

/** Legacy keys from an earlier rename (HomePin: vs homepin:). */
const LEGACY_PREFIX = "HomePin:";

/** Copy data from legacy HomePin:* keys to homepin:* if needed. */
export function migrateLegacyStorageKeys() {
  if (typeof window === "undefined") return;

  const mappings: Record<string, string> = {
    [`${LEGACY_PREFIX}profile`]: storageKeys.profile,
    [`${LEGACY_PREFIX}plan`]: storageKeys.plan,
    [`${LEGACY_PREFIX}documents`]: storageKeys.documents,
    [`${LEGACY_PREFIX}trusted-contacts`]: storageKeys.trustedContacts,
    [`${LEGACY_PREFIX}important-contacts`]: storageKeys.importantContacts,
    [`${LEGACY_PREFIX}digital-assets`]: storageKeys.digitalAssets,
    [`${LEGACY_PREFIX}checklist`]: storageKeys.checklist,
    [`${LEGACY_PREFIX}shared-credentials`]: storageKeys.sharedCredentials,
    [`${LEGACY_PREFIX}household-info`]: storageKeys.householdInfo,
    [`${LEGACY_PREFIX}messages`]: storageKeys.messages,
    [`${LEGACY_PREFIX}welcome-complete`]: storageKeys.welcomeComplete,
    [`${LEGACY_PREFIX}theme`]: storageKeys.theme,
    [`${LEGACY_PREFIX}accessibility`]: storageKeys.accessibility,
    [`${LEGACY_PREFIX}notifications`]: storageKeys.notifications,
    [`${LEGACY_PREFIX}checkin-days`]: storageKeys.checkinDays,
    [`${LEGACY_PREFIX}locale`]: storageKeys.locale,
    [`${LEGACY_PREFIX}pwa-dismissed`]: storageKeys.pwaDismissed,
  };

  for (const [legacyKey, newKey] of Object.entries(mappings)) {
    const legacyValue = localStorage.getItem(legacyKey);
    if (legacyValue && !localStorage.getItem(newKey)) {
      localStorage.setItem(newKey, legacyValue);
    }
    if (legacyValue) {
      localStorage.removeItem(legacyKey);
    }
  }
}
