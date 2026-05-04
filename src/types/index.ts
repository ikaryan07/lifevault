export interface Document {
  id: string;
  user_id: string;
  title: string;
  category: DocumentCategory;
  file_name: string;
  file_size: number;
  mime_type: string;
  storage_path: string;
  encrypted_key: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type DocumentCategory =
  | "will"
  | "insurance"
  | "property"
  | "superannuation"
  | "banking"
  | "tax"
  | "medical"
  | "identity"
  | "funeral"
  | "digital"
  | "legal"
  | "other";

export const DOCUMENT_CATEGORIES: Record<
  DocumentCategory,
  { label: string; description: string }
> = {
  will: { label: "Will & Testament", description: "Wills, codicils, testamentary trusts" },
  insurance: { label: "Insurance", description: "Life, home, health, car policies" },
  property: { label: "Property", description: "Deeds, titles, mortgage documents" },
  superannuation: { label: "Superannuation", description: "Super statements, binding nominations" },
  banking: { label: "Banking & Finance", description: "Bank accounts, investments, debts" },
  tax: { label: "Tax", description: "Tax returns, ATO correspondence" },
  medical: { label: "Medical", description: "Advance care directives, medical records" },
  identity: { label: "Identity", description: "Birth certificate, passport, licence" },
  funeral: { label: "Funeral Wishes", description: "Funeral plans, prepaid arrangements" },
  digital: { label: "Digital Accounts", description: "Online accounts, subscriptions, social media" },
  legal: { label: "Legal", description: "Power of attorney, guardianship, court orders" },
  other: { label: "Other", description: "Anything else important" },
};

export interface TrustedContact {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  relationship: string;
  role: "full_access" | "limited_access" | "on_death_only";
  access_granted: boolean;
  invited_at: string;
  accepted_at?: string;
}

export interface ImportantContact {
  id: string;
  user_id: string;
  name: string;
  role: string;
  organization?: string;
  phone?: string;
  email?: string;
  notes?: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  description?: string;
  completed: boolean;
  completed_at?: string;
}

export interface Checklist {
  id: string;
  user_id: string;
  type: "before" | "after";
  title: string;
  items: ChecklistItem[];
  progress: number;
}
