"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useVault } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, X, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

function pageFromPath(pathname: string): string {
  if (pathname === "/dashboard" || pathname === "/dashboard/") return "dashboard";
  if (pathname.startsWith("/dashboard/family/passwords")) return "passwords";
  if (pathname.startsWith("/dashboard/family/household")) return "household";
  if (pathname.startsWith("/dashboard/vault")) return "vault";
  if (pathname.startsWith("/dashboard/contacts")) return "contacts";
  if (pathname.startsWith("/dashboard/checklist")) return "checklist";
  if (pathname.startsWith("/dashboard/directory")) return "directory";
  if (pathname.startsWith("/dashboard/digital")) return "digital";
  return "";
}

interface GuideSuggestion {
  message: string;
  action?: string;
  href?: string;
}

function getContextualSuggestion(
  page: string,
  context: {
    docCount: number;
    contactCount: number;
    checklistBefore: number;
    checklistAfter: number;
    digitalAssetCount: number;
    importantContactCount: number;
    credentialCount: number;
    householdCount: number;
  }
): GuideSuggestion | null {
  const { docCount, contactCount, checklistBefore, digitalAssetCount, importantContactCount, credentialCount, householdCount } = context;

  switch (page) {
    case "dashboard":
      if (credentialCount === 0)
        return { message: "Start with something useful — save your WiFi password so your family always has it.", action: "Save a password", href: "/dashboard/family/passwords" };
      if (docCount === 0)
        return { message: "Great start with your passwords! When you're ready, upload your first important document.", action: "Upload a document", href: "/dashboard/vault" };
      if (contactCount === 0)
        return { message: "Nice progress! Next, add someone you trust who can access your vault when needed.", action: "Add a trusted person", href: "/dashboard/contacts" };
      if (checklistBefore === 0)
        return { message: "Your vault is taking shape! Try ticking off one item on your planning checklist.", action: "Open checklist", href: "/dashboard/checklist" };
      if (checklistBefore < 8)
        return { message: `You've completed ${checklistBefore} checklist items — you're doing really well. Keep going when you're ready.` };
      return { message: "Your vault is in great shape. Remember to review it every few months to keep things current." };

    case "passwords":
      if (credentialCount === 0)
        return { message: "Save your home WiFi password first — it's the one thing everyone in the house needs." };
      if (credentialCount < 3)
        return { message: "Good start! Don't forget your streaming services — Netflix, Stan, Disney+ — and any bills you share." };
      return null;

    case "household":
      if (householdCount === 0)
        return { message: "Start with your home address and your doctor's number. These are the things your family will look for first." };
      return null;

    case "vault":
      if (docCount === 0)
        return { message: "Your vault is empty. Start with whatever's most important to you — a will, insurance policy, or even a simple contact list." };
      if (docCount < 3)
        return { message: "Good start! Most people store 5-10 key documents. Consider adding your insurance policies or super details." };
      if (docCount >= 3 && docCount < 7)
        return { message: "Your vault is growing nicely. Don't forget about property documents and identity certificates." };
      return null;

    case "contacts":
      if (contactCount === 0)
        return { message: "Add at least one person you trust — a partner, adult child, or solicitor. They'll only get access when it's needed." };
      if (contactCount === 1)
        return { message: "Having one trusted contact is great, but we recommend at least two. This adds an extra layer of security for the vault access process." };
      return null;

    case "checklist":
      if (checklistBefore === 0)
        return { message: "Don't feel overwhelmed — just pick one section to start with. 'Legal & Estate Planning' is the most important." };
      if (checklistBefore > 0 && checklistBefore < 16)
        return { message: `${checklistBefore} items done! Take your time — there's no deadline. Even one item a week makes a huge difference.` };
      return null;

    case "directory":
      if (importantContactCount === 0)
        return { message: "Add the professionals your family might need — solicitor, accountant, doctor, or financial advisor." };
      return null;

    case "digital":
      if (digitalAssetCount === 0)
        return { message: "List your important online accounts — email, banking, social media. Your family will need to know these exist." };
      if (digitalAssetCount < 5)
        return { message: "Don't forget about email accounts, cloud storage, and any accounts with money or subscriptions." };
      return null;

    default:
      return null;
  }
}

export function GentleGuide({ page }: { page?: string } = {}) {
  const pathname = usePathname();
  const [dismissed, setDismissed] = useState(false);
  const { documents, trustedContacts, checklist, digitalAssets, importantContacts, sharedCredentials, householdInfo, isHydrated } = useVault();

  if (!isHydrated) return null;

  const resolvedPage = page ?? pageFromPath(pathname || "");
  if (!resolvedPage) return null;

  const checklistBefore = Object.values(checklist.before).filter(Boolean).length;
  const checklistAfter = Object.values(checklist.after).filter(Boolean).length;

  const suggestion = getContextualSuggestion(resolvedPage, {
    docCount: documents.length,
    contactCount: trustedContacts.length,
    checklistBefore,
    checklistAfter,
    digitalAssetCount: digitalAssets.length,
    importantContactCount: importantContacts.length,
    credentialCount: sharedCredentials.length,
    householdCount: householdInfo.length,
  });

  if (!suggestion || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="mb-6"
      >
        <div className={cn(
          "flex items-start gap-3 rounded-xl border p-4",
          "border-primary/20 bg-primary/5"
        )}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Lightbulb className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground leading-relaxed">
              {suggestion.message}
            </p>
            {suggestion.href && suggestion.action && (
              <Link
                href={suggestion.href}
                className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                {suggestion.action}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="shrink-0 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Dismiss suggestion"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
