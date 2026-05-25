"use client";

import { useState } from "react";
import { useVault } from "@/lib/store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle2,
  Circle,
  PartyPopper,
  ChevronDown,
  Scale,
  Wallet,
  Home,
  FileText,
  Heart,
  Building2,
  Bell,
  CreditCard,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/motion/page-transition";
import { cn } from "@/lib/utils";

interface ChecklistItemDef {
  id: string;
  label: string;
  description: string;
}

interface ChecklistSection {
  id: string;
  title: string;
  icon: React.ElementType;
  items: ChecklistItemDef[];
}

const beforeSections: ChecklistSection[] = [
  {
    id: "legal",
    title: "Legal & Estate Planning",
    icon: Scale,
    items: [
      { id: "will", label: "Create or update your Will", description: "Outlines how your assets are distributed and who manages it." },
      { id: "poa", label: "Set up Enduring Power of Attorney", description: "Authorises someone for financial/legal decisions if you lose capacity." },
      { id: "guardianship", label: "Appoint an Enduring Guardian", description: "For lifestyle and health decisions if you can't decide yourself." },
      { id: "medical", label: "Write an Advance Care Directive", description: "Your preferences for medical treatment and end-of-life care." },
      { id: "wishes", label: "Write a Statement of Wishes", description: "Informal letter — funeral wishes, keepsakes, guidance for executor." },
    ],
  },
  {
    id: "financial",
    title: "Financial Records",
    icon: Wallet,
    items: [
      { id: "super", label: "Update super death benefit nomination", description: "Directs who receives your super (doesn't automatically go to estate)." },
      { id: "assets-register", label: "Create an asset and liability register", description: "All assets (accounts, shares, property) and debts (mortgages, loans)." },
      { id: "insurance", label: "Document all insurance policies", description: "Life, income protection, health, home/contents, car." },
      { id: "tax", label: "Organise tax records", description: "Your Tax File Number and most recent tax return." },
    ],
  },
  {
    id: "personal",
    title: "Personal & Identity Documents",
    icon: FileText,
    items: [
      { id: "identity-certs", label: "Gather identity certificates", description: "Birth, marriage, divorce certificates." },
      { id: "identity-ids", label: "Store passport and licence details", description: "Note where these are kept." },
      { id: "govt-cards", label: "Record Medicare and pension cards", description: "Medicare, pension, concession, DVA card details." },
    ],
  },
  {
    id: "practical",
    title: "Practical & Day-to-Day",
    icon: Home,
    items: [
      { id: "property", label: "Organise property documents", description: "Title deeds, mortgage, rental agreements." },
      { id: "digital", label: "Document online accounts", description: "List accounts and where your password manager is." },
      { id: "contacts", label: "Add professional contacts", description: "Solicitor, accountant, advisor, doctor, funeral director." },
      { id: "funeral", label: "Record funeral wishes", description: "Burial/cremation, service type, prepaid arrangements." },
    ],
  },
];

const afterSections: ChecklistSection[] = [
  {
    id: "immediate",
    title: "First Week",
    icon: Heart,
    items: [
      { id: "certificate", label: "Obtain the death certificate", description: "Get multiple certified copies from Births, Deaths and Marriages." },
      { id: "notify-family", label: "Notify family and close friends", description: "Inform immediate and extended family." },
      { id: "funeral", label: "Arrange the funeral or memorial", description: "Check for funeral wishes and prepaid plans." },
      { id: "solicitor", label: "Locate the will / contact solicitor", description: "Begin probate if required." },
    ],
  },
  {
    id: "government",
    title: "Government Notifications",
    icon: Building2,
    items: [
      { id: "centrelink", label: "Notify Centrelink", description: "Stop payments, claim bereavement allowance. 132 300." },
      { id: "medicare", label: "Cancel Medicare", description: "Return the card. 132 011." },
      { id: "ato", label: "Notify the ATO", description: "Lodge date-of-death tax return. 13 28 61." },
      { id: "electoral", label: "Notify Electoral Commission", description: "Remove from electoral roll. 13 23 26." },
      { id: "passport", label: "Cancel the passport", description: "Return through the Passport Office." },
      { id: "dva", label: "Notify DVA (if applicable)", description: "Stop benefits, check bereavement support." },
    ],
  },
  {
    id: "financial-after",
    title: "Financial & Insurance",
    icon: CreditCard,
    items: [
      { id: "banks", label: "Notify banks", description: "Freeze/close accounts with death certificate." },
      { id: "super-claim", label: "Claim super death benefit", description: "Lodge claim. Check for life insurance in super." },
      { id: "insurance-claim", label: "Lodge insurance claims", description: "Life, income protection, other policies." },
      { id: "debts", label: "Identify and manage debts", description: "Mortgages, loans, credit cards. Some may have death cover." },
    ],
  },
  {
    id: "practical-after",
    title: "Practical & Accounts",
    icon: Bell,
    items: [
      { id: "utilities", label: "Cancel or transfer utilities", description: "Electricity, gas, water, internet, phone." },
      { id: "subscriptions", label: "Cancel subscriptions", description: "Streaming, gym, associations, etc." },
      { id: "social-media", label: "Manage social media", description: "Memorialise or close accounts." },
      { id: "employer", label: "Notify employer", description: "Final pay, leave, return work property." },
      { id: "mail-redirect", label: "Redirect mail", description: "Australia Post redirection to executor." },
    ],
  },
];

const allBeforeItems = beforeSections.flatMap((s) => s.items);
const allAfterItems = afterSections.flatMap((s) => s.items);

function SectionGroup({ section, completedMap, onToggle }: {
  section: ChecklistSection;
  completedMap: Record<string, boolean>;
  onToggle: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const done = section.items.filter((i) => completedMap[i.id]).length;
  const allDone = done === section.items.length;
  const panelId = `checklist-section-${section.id}`;

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        aria-controls={panelId}
        className="flex w-full items-center gap-3 p-4 text-left hover:bg-muted/50 transition-colors"
      >
        <div className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg",
          allDone ? "bg-green-100 dark:bg-green-500/10" : "bg-primary/10"
        )}>
          {allDone ? (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          ) : (
            <section.icon className="h-4 w-4 text-primary" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn("text-sm font-semibold", allDone && "text-green-600")}>
            {section.title}
          </p>
          <p className="text-xs text-muted-foreground">
            {done} of {section.items.length} done
          </p>
        </div>
        <ChevronDown className={cn(
          "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
          !expanded && "-rotate-90"
        )} />
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t px-2 pb-2">
              {section.items.map((item) => {
                const completed = completedMap[item.id] || false;
                return (
                  <button
                    key={item.id}
                    onClick={() => onToggle(item.id)}
                    role="checkbox"
                    aria-checked={completed}
                    className="flex w-full items-start gap-3 rounded-lg p-3 text-left hover:bg-muted/50 transition-colors"
                  >
                    <motion.div whileTap={{ scale: 0.85 }} className="mt-0.5 shrink-0">
                      {completed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground/30" />
                      )}
                    </motion.div>
                    <div className="min-w-0">
                      <p className={cn(
                        "text-sm font-medium",
                        completed ? "text-muted-foreground line-through" : "text-foreground"
                      )}>
                        {item.label}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ChecklistPage() {
  const { checklist, setChecklist, isHydrated, cloudMode, toggleChecklistItem } = useVault();

  function toggleBefore(id: string) {
    setChecklist((prev) => {
      const wasCompleted = prev.before[id];
      const nextBefore = { ...prev.before, [id]: !wasCompleted };
      if (cloudMode) {
        toggleChecklistItem("before", id, !wasCompleted);
      }
      if (!wasCompleted) {
        const n = Object.values(nextBefore).filter(Boolean).length;
        if (n === allBeforeItems.length) {
          toast.success("Checklist complete!", {
            description: "Amazing — you've done everything!",
            icon: <PartyPopper className="h-5 w-5 text-amber-500" />,
          });
        } else if (n === 1) {
          toast.success("Great start!", { description: "First item done!" });
        } else if (n % 4 === 0) {
          toast.success(`${n} items done!`, { description: "Real progress." });
        }
      }
      return { ...prev, before: nextBefore };
    });
  }

  function toggleAfter(id: string) {
    const wasCompleted = checklist.after[id];
    setChecklist((prev) => ({
      ...prev,
      after: { ...prev.after, [id]: !wasCompleted },
    }));
    if (cloudMode) {
      toggleChecklistItem("after", id, !wasCompleted);
    }
    if (!wasCompleted) {
      toast.success("Step complete", { description: "One less thing to worry about." });
    }
  }

  if (!isHydrated) {
    return (
      <div className="flex h-64 items-center justify-center" role="status" aria-label="Loading">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const beforeDone = Object.values(checklist.before).filter(Boolean).length;
  const afterDone = Object.values(checklist.after).filter(Boolean).length;
  const beforePct = Math.round((beforeDone / allBeforeItems.length) * 100);
  const afterPct = Math.round((afterDone / allAfterItems.length) * 100);

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Your Checklists</h1>
          <p className="mt-1 text-muted-foreground">
            Grouped into sections so you can focus on one area at a time. No rush.
          </p>
        </div>

        <Tabs defaultValue="before" className="w-full">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="before" className="flex-1 sm:flex-initial">
              Planning ({beforeDone}/{allBeforeItems.length})
            </TabsTrigger>
            <TabsTrigger value="after" className="flex-1 sm:flex-initial">
              For Family ({afterDone}/{allAfterItems.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="before" className="mt-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 h-3 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-primary/80"
                  initial={{ width: 0 }}
                  animate={{ width: `${beforePct}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
              <span className="text-sm font-bold text-primary">{beforePct}%</span>
            </div>

            <div className="space-y-3">
              {beforeSections.map((s) => (
                <SectionGroup
                  key={s.id}
                  section={s}
                  completedMap={checklist.before}
                  onToggle={toggleBefore}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="after" className="mt-6 space-y-4">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/20 dark:bg-amber-500/5">
              <p className="text-sm text-amber-800 dark:text-amber-300">
                This checklist is for your family after you pass. It will be shared with
                your trusted contacts when they gain access.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1 h-3 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-primary/80"
                  initial={{ width: 0 }}
                  animate={{ width: `${afterPct}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
              <span className="text-sm font-bold text-primary">{afterPct}%</span>
            </div>

            <div className="space-y-3">
              {afterSections.map((s) => (
                <SectionGroup
                  key={s.id}
                  section={s}
                  completedMap={checklist.after}
                  onToggle={toggleAfter}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  );
}
