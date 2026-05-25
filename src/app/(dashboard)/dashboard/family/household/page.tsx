"use client";

import { useState } from "react";
import { useVault, HouseholdItem, HouseholdCategory, HOUSEHOLD_CATEGORIES } from "@/lib/store";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Home,
  Phone,
  Zap,
  Heart,
  GraduationCap,
  Award,
  Car,
  FileText,
  Plus,
  Pencil,
  Trash2,
  Copy,
  Check,
  ClipboardList,
  Lightbulb,
  X,
  ChevronRight,
} from "lucide-react";
import type { ComponentType } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/motion/page-transition";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { SearchInput } from "@/components/ui/search-input";
import { cn } from "@/lib/utils";

const categoryIcons: Record<HouseholdCategory, ComponentType<{ className?: string }>> = {
  address: Home,
  emergency: Phone,
  utility: Zap,
  medical: Heart,
  school: GraduationCap,
  membership: Award,
  vehicle: Car,
  other: FileText,
};

const categoryColors: Record<HouseholdCategory, string> = {
  address: "bg-blue-500/10 text-blue-600",
  emergency: "bg-red-500/10 text-red-600",
  utility: "bg-amber-500/10 text-amber-600",
  medical: "bg-pink-500/10 text-pink-600",
  school: "bg-indigo-500/10 text-indigo-600",
  membership: "bg-green-500/10 text-green-600",
  vehicle: "bg-slate-500/10 text-slate-600",
  other: "bg-gray-500/10 text-gray-600",
};

const quickAddSuggestions = [
  { label: "Home address", category: "address" as HouseholdCategory },
  { label: "Doctor", category: "medical" as HouseholdCategory },
  { label: "Electricity provider", category: "utility" as HouseholdCategory },
  { label: "Kids' school", category: "school" as HouseholdCategory },
  { label: "Car registration", category: "vehicle" as HouseholdCategory },
  { label: "Emergency contact", category: "emergency" as HouseholdCategory },
];

const ideaSuggestions: { label: string; hint: string; category: HouseholdCategory }[] = [
  { label: "Home address", hint: "Full street address and postcode", category: "address" },
  { label: "Landlord / real estate agent", hint: "Name and contact number", category: "address" },
  { label: "Spare key location", hint: "Where you keep the spare", category: "address" },
  { label: "Alarm code", hint: "Home security PIN", category: "address" },
  { label: "GP / Family doctor", hint: "Name, clinic, phone number", category: "medical" },
  { label: "Dentist", hint: "Practice name and phone", category: "medical" },
  { label: "Pharmacy", hint: "Name and address", category: "medical" },
  { label: "Health insurance", hint: "Provider and membership number", category: "medical" },
  { label: "Medicare number", hint: "Card number and IRN", category: "medical" },
  { label: "Ambulance membership", hint: "Membership number", category: "medical" },
  { label: "Electricity provider", hint: "Company, account number, NMI", category: "utility" },
  { label: "Gas provider", hint: "Company and account number", category: "utility" },
  { label: "Water provider", hint: "Company and account number", category: "utility" },
  { label: "Internet provider", hint: "Plan, account number", category: "utility" },
  { label: "Home insurance", hint: "Provider and policy number", category: "utility" },
  { label: "Council rates", hint: "Council name and property number", category: "utility" },
  { label: "Kids' school", hint: "School name, phone, class", category: "school" },
  { label: "Childcare centre", hint: "Name, phone, CRN", category: "school" },
  { label: "School bus info", hint: "Route number and pickup time", category: "school" },
  { label: "Emergency contact for school", hint: "Who to call if you can't", category: "school" },
  { label: "Car registration", hint: "Rego number and expiry date", category: "vehicle" },
  { label: "Car insurance", hint: "Provider and policy number", category: "vehicle" },
  { label: "Roadside assist", hint: "Provider and membership number", category: "vehicle" },
  { label: "Mechanic", hint: "Name and phone number", category: "vehicle" },
  { label: "Gym membership", hint: "Number and entry code", category: "membership" },
  { label: "Library card", hint: "Card number", category: "membership" },
  { label: "Frequent flyer", hint: "Airline and number", category: "membership" },
  { label: "ICE contact", hint: "In Case of Emergency person", category: "emergency" },
  { label: "Neighbour", hint: "Name and phone for emergencies", category: "emergency" },
  { label: "Vet", hint: "Clinic name and phone", category: "emergency" },
  { label: "Plumber", hint: "Name and phone", category: "emergency" },
  { label: "Electrician", hint: "Name and phone", category: "emergency" },
];

export default function HouseholdPage() {
  const {
    householdInfo,
    setHouseholdInfo,
    plan,
    isHydrated,
    cloudMode,
    upsertHousehold,
    removeHousehold,
  } = useVault();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<HouseholdItem | null>(null);
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [ideasOpen, setIdeasOpen] = useState(false);

  const [itemLabel, setItemLabel] = useState("");
  const [category, setCategory] = useState<HouseholdCategory>("address");
  const [value, setValue] = useState("");
  const [notes, setNotes] = useState("");

  if (!isHydrated) {
    return (
      <div className="flex h-64 items-center justify-center" role="status" aria-label="Loading">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  function resetForm() {
    setItemLabel("");
    setCategory("address");
    setValue("");
    setNotes("");
    setEditing(null);
  }

  const atLimit = isFinite(plan.limits.household) && householdInfo.length >= plan.limits.household;

  function openCreate(preset?: { label: string; category: HouseholdCategory }) {
    if (atLimit) {
      toast.error(`${plan.name} plan limit reached`, {
        description: `Upgrade your plan to add more than ${plan.limits.household} household items.`,
        action: { label: "Upgrade", onClick: () => window.location.assign("/dashboard/settings/plan") },
      });
      return;
    }
    resetForm();
    if (preset) {
      setItemLabel(preset.label);
      setCategory(preset.category);
    }
    setDialogOpen(true);
  }

  function openEdit(item: HouseholdItem) {
    setEditing(item);
    setItemLabel(item.label);
    setCategory(item.category);
    setValue(item.value);
    setNotes(item.notes || "");
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!itemLabel.trim()) {
      toast.error("Please enter a label");
      return;
    }
    if (!value.trim()) {
      toast.error("Please enter the details");
      return;
    }

    const isNew = !editing;
    const entry: HouseholdItem = {
      id: editing?.id || crypto.randomUUID(),
      category,
      label: itemLabel.trim(),
      value: value.trim(),
      notes: notes.trim() || undefined,
      updatedAt: new Date().toISOString(),
    };

    if (cloudMode) {
      const result = await upsertHousehold(entry, isNew);
      if (result.error) {
        toast.error("Could not save", { description: result.error });
        return;
      }
      const saved = result.item!;
      if (editing) {
        setHouseholdInfo((prev) =>
          prev.map((item) => (item.id === editing.id ? saved : item))
        );
      } else {
        setHouseholdInfo((prev) => [saved, ...prev]);
      }
    } else if (editing) {
      setHouseholdInfo((prev) =>
        prev.map((item) => (item.id === editing.id ? entry : item))
      );
    } else {
      setHouseholdInfo((prev) => [entry, ...prev]);
    }

    toast.success(editing ? "Updated" : "Added", {
      description: cloudMode
        ? `${itemLabel} saved — your whole family can see it.`
        : `${itemLabel} has been saved on this device.`,
    });
    setDialogOpen(false);
    resetForm();
  }

  async function confirmDelete() {
    if (!deleteId) return;
    const item = householdInfo.find((i) => i.id === deleteId);

    if (cloudMode) {
      const result = await removeHousehold(deleteId);
      if (result.error) {
        toast.error("Could not delete", { description: result.error });
        setDeleteId(null);
        return;
      }
    }

    setHouseholdInfo((prev) => prev.filter((i) => i.id !== deleteId));
    toast.success("Deleted", { description: `${item?.label || "Item"} has been removed.` });
    setDeleteId(null);
  }

  const itemToDelete = deleteId
    ? householdInfo.find((i) => i.id === deleteId)
    : null;

  async function copyToClipboard(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Couldn't copy", {
        description: "Your browser blocked clipboard access. Try copying manually.",
      });
    }
  }

  const filtered = householdInfo.filter((item) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      item.label.toLowerCase().includes(q) ||
      item.value.toLowerCase().includes(q) ||
      item.notes?.toLowerCase().includes(q)
    );
  });

  const grouped = filtered.reduce(
    (acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<HouseholdCategory, HouseholdItem[]>
  );

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Household Info
            </h1>
            <p className="mt-1 text-muted-foreground">
              Important details your family needs — addresses, emergency numbers, providers.
            </p>
          </div>
          <Button onClick={() => openCreate()} className="w-full shrink-0 gap-2 sm:w-auto">
            <Plus className="h-4 w-4" />
            Add Info
          </Button>
        </div>

        {/* Search */}
        {householdInfo.length > 0 && (
          <SearchInput
            placeholder="Search household info..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search household info"
          />
        )}

        {/* Content */}
        {filtered.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <ClipboardList className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">
                {search ? "No results found" : "No household info yet"}
              </h3>
              <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
                {search
                  ? "Try a different search term."
                  : "Keep important household details here so your family always knows where to find them."}
              </p>
              {!search && (
                <div className="mt-6 space-y-3">
                  <p className="text-xs font-medium text-muted-foreground">Quick add:</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {quickAddSuggestions.map((s) => (
                      <button
                        key={s.label}
                        onClick={() => openCreate(s)}
                        className="rounded-full border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/30 hover:bg-primary/5"
                      >
                        + {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([cat, items]) => {
              const catKey = cat as HouseholdCategory;
              const Icon = categoryIcons[catKey];
              const colorClass = categoryColors[catKey];

              return (
                <div key={cat}>
                  <div className="mb-3 flex items-center gap-2">
                    <div className={cn("flex h-7 w-7 items-center justify-center rounded-lg", colorClass)}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <h2 className="text-sm font-semibold text-foreground">
                      {HOUSEHOLD_CATEGORIES[catKey].label}
                    </h2>
                    <span className="text-xs text-muted-foreground">({items.length})</span>
                  </div>

                  <StaggerContainer className="space-y-2">
                    <AnimatePresence mode="popLayout">
                      {items.map((item) => (
                        <StaggerItem key={item.id}>
                          <motion.div
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                          >
                            <Card className="group transition-all hover:shadow-md">
                              <CardContent className="flex items-start gap-4 p-4">
                                <div className={cn("mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", colorClass)}>
                                  <Icon className="h-5 w-5" />
                                </div>

                                <div className="min-w-0 flex-1">
                                  <p className="font-semibold text-foreground">
                                    {item.label}
                                  </p>
                                  <button
                                    onClick={() => copyToClipboard(item.value, item.id)}
                                    className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
                                    title="Copy to clipboard"
                                  >
                                    {copiedId === item.id ? (
                                      <Check className="h-3 w-3 shrink-0 text-green-500" />
                                    ) : (
                                      <Copy className="h-3 w-3 shrink-0" />
                                    )}
                                    <span className="break-words">{item.value}</span>
                                  </button>
                                  {item.notes && (
                                    <p className="mt-1 text-xs text-muted-foreground/70">
                                      {item.notes}
                                    </p>
                                  )}
                                </div>

                                <div className="flex shrink-0 gap-1 self-end sm:self-auto sm:opacity-60 sm:transition-opacity sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                                  <button
                                    onClick={() => openEdit(item)}
                                    aria-label={`Edit ${item.label}`}
                                    className="flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors sm:h-auto sm:w-auto sm:p-2"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => setDeleteId(item.id)}
                                    aria-label={`Delete ${item.label}`}
                                    className="flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors sm:h-auto sm:w-auto sm:p-2"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        </StaggerItem>
                      ))}
                    </AnimatePresence>
                  </StaggerContainer>
                </div>
              );
            })}
          </div>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Info" : "Add Household Info"}</DialogTitle>
              <DialogDescription>
                {editing
                  ? "Update this household detail."
                  : "Save something your family might need to know."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="item-label">What is it? *</Label>
                <Input
                  id="item-label"
                  placeholder="e.g. Home WiFi password, Doctor's number, Electricity provider"
                  value={itemLabel}
                  onChange={(e) => setItemLabel(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="item-category">Category</Label>
                <select
                  id="item-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as HouseholdCategory)}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                >
                  {Object.entries(HOUSEHOLD_CATEGORIES).map(([key, { label }]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="item-value">Details *</Label>
                <Textarea
                  id="item-value"
                  placeholder="e.g. 04XX XXX XXX, 123 Main Street, Account #12345"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="item-notes">Notes (optional)</Label>
                <Input
                  id="item-notes"
                  placeholder="Any extra context"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <Button onClick={handleSave} className="w-full">
                {editing ? "Save Changes" : "Add Info"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Floating Ideas Panel */}
        <IdeasPanel
          isOpen={ideasOpen}
          onToggle={() => setIdeasOpen(!ideasOpen)}
          existingLabels={householdInfo.map((i) => i.label.toLowerCase())}
          onSelect={(idea) => {
            setIdeasOpen(false);
            openCreate({ label: idea.label, category: idea.category });
          }}
        />

        <ConfirmDialog
          open={!!deleteId}
          onOpenChange={(open) => !open && setDeleteId(null)}
          title="Delete this item?"
          description={
            <>
              <strong className="text-foreground">{itemToDelete?.label}</strong>{" "}
              will be permanently removed from your household info.
            </>
          }
          confirmLabel="Yes, delete"
          variant="destructive"
          onConfirm={confirmDelete}
        />
      </div>
    </PageTransition>
  );
}

function IdeasPanel({
  isOpen,
  onToggle,
  existingLabels,
  onSelect,
}: {
  isOpen: boolean;
  onToggle: () => void;
  existingLabels: string[];
  onSelect: (idea: { label: string; hint: string; category: HouseholdCategory }) => void;
}) {
  const remaining = ideaSuggestions.filter(
    (s) => !existingLabels.includes(s.label.toLowerCase())
  );

  const grouped = remaining.reduce(
    (acc, idea) => {
      if (!acc[idea.category]) acc[idea.category] = [];
      acc[idea.category].push(idea);
      return acc;
    },
    {} as Record<HouseholdCategory, typeof ideaSuggestions>
  );

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls="ideas-panel"
        className={cn(
          "fab-above-tab-bar fixed right-4 z-40 flex min-h-11 items-center gap-2 rounded-full px-4 py-3 text-sm font-medium shadow-lg transition-colors lg:bottom-8 lg:right-6",
          isOpen
            ? "bg-foreground text-background"
            : "bg-primary text-primary-foreground hover:bg-primary/90"
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? (
          <>
            <X className="h-4 w-4" />
            Close
          </>
        ) : (
          <>
            <Lightbulb className="h-4 w-4" />
            Ideas
            {remaining.length > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-foreground/20 text-[10px] font-bold">
                {remaining.length}
              </span>
            )}
          </>
        )}
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            id="ideas-panel"
            className="panel-above-tab-bar fixed inset-x-4 z-40 max-h-[50vh] overflow-y-auto rounded-2xl border bg-card shadow-2xl sm:inset-x-auto sm:right-6 sm:w-80 sm:max-h-[60vh] lg:bottom-20"
          >
            <div className="sticky top-0 z-10 border-b bg-card/95 backdrop-blur-sm p-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">What else could you add?</h3>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Tap any item to add it. {remaining.length} suggestions remaining.
              </p>
            </div>

            <div className="p-3 space-y-4">
              {remaining.length === 0 ? (
                <div className="py-8 text-center">
                  <Check className="mx-auto h-8 w-8 text-green-500" />
                  <p className="mt-2 text-sm font-medium text-foreground">
                    You&apos;ve covered everything!
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Great job keeping your household info complete.
                  </p>
                </div>
              ) : (
                Object.entries(grouped).map(([cat, ideas]) => {
                  const catKey = cat as HouseholdCategory;
                  const Icon = categoryIcons[catKey];
                  const colorClass = categoryColors[catKey];

                  return (
                    <div key={cat}>
                      <div className="mb-1.5 flex items-center gap-2 px-1">
                        <div className={cn("flex h-5 w-5 items-center justify-center rounded", colorClass)}>
                          <Icon className="h-3 w-3" />
                        </div>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          {HOUSEHOLD_CATEGORIES[catKey].label}
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        {ideas.map((idea) => (
                          <button
                            key={idea.label}
                            onClick={() => onSelect(idea)}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-muted"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground">
                                {idea.label}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {idea.hint}
                              </p>
                            </div>
                            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
