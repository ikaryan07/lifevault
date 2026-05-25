"use client";

import { useState } from "react";
import { useVault, SharedCredential, CredentialCategory, CREDENTIAL_CATEGORIES } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
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
  Wifi,
  Tv,
  Zap,
  ShieldCheck,
  Landmark,
  MessageCircle,
  ShoppingBag,
  Key,
  Plus,
  Eye,
  EyeOff,
  Copy,
  Pencil,
  Trash2,
  Check,
  Search,
  KeyRound,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/motion/page-transition";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";

const categoryIcons: Record<CredentialCategory, React.ComponentType<{ className?: string }>> = {
  wifi: Wifi,
  streaming: Tv,
  utilities: Zap,
  insurance: ShieldCheck,
  banking: Landmark,
  social: MessageCircle,
  shopping: ShoppingBag,
  other: Key,
};

const categoryColors: Record<CredentialCategory, string> = {
  wifi: "bg-blue-500/10 text-blue-600",
  streaming: "bg-purple-500/10 text-purple-600",
  utilities: "bg-amber-500/10 text-amber-600",
  insurance: "bg-green-500/10 text-green-600",
  banking: "bg-emerald-500/10 text-emerald-600",
  social: "bg-pink-500/10 text-pink-600",
  shopping: "bg-orange-500/10 text-orange-600",
  other: "bg-gray-500/10 text-gray-600",
};

export default function PasswordsPage() {
  const {
    sharedCredentials,
    setSharedCredentials,
    plan,
    isHydrated,
    cloudMode,
    upsertCredential,
    removeCredential,
  } = useVault();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<SharedCredential | null>(null);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<CredentialCategory | "all">("all");
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [formPasswordVisible, setFormPasswordVisible] = useState(false);

  const [name, setName] = useState("");
  const [category, setCategory] = useState<CredentialCategory>("wifi");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [url, setUrl] = useState("");
  const [pin, setPin] = useState("");
  const [notes, setNotes] = useState("");

  if (!isHydrated) {
    return (
      <div className="flex h-64 items-center justify-center" role="status" aria-label="Loading">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  function resetForm() {
    setName("");
    setCategory("wifi");
    setUsername("");
    setPassword("");
    setUrl("");
    setPin("");
    setNotes("");
    setEditing(null);
    setFormPasswordVisible(false);
  }

  const atLimit = isFinite(plan.limits.passwords) && sharedCredentials.length >= plan.limits.passwords;

  function openCreate() {
    if (atLimit) {
      toast.error(`${plan.name} plan limit reached`, {
        description: `Upgrade your plan to add more than ${plan.limits.passwords} passwords.`,
        action: { label: "Upgrade", onClick: () => window.location.assign("/dashboard/settings/plan") },
      });
      return;
    }
    resetForm();
    setDialogOpen(true);
  }

  function openEdit(cred: SharedCredential) {
    setEditing(cred);
    setName(cred.name);
    setCategory(cred.category);
    setUsername(cred.username || "");
    setPassword(cred.password || "");
    setUrl(cred.url || "");
    setPin(cred.pin || "");
    setNotes(cred.notes || "");
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!name.trim()) {
      toast.error("Please enter a name");
      return;
    }

    const isNew = !editing;
    const entry: SharedCredential = {
      id: editing?.id || crypto.randomUUID(),
      category,
      name: name.trim(),
      username: username.trim() || undefined,
      password: password || undefined,
      url: url.trim() || undefined,
      pin: pin.trim() || undefined,
      notes: notes.trim() || undefined,
      updatedAt: new Date().toISOString(),
    };

    if (cloudMode) {
      const result = await upsertCredential(entry, isNew);
      if (result.error) {
        toast.error("Could not save", { description: result.error });
        return;
      }
      const saved = result.entry!;
      if (editing) {
        setSharedCredentials((prev) =>
          prev.map((c) => (c.id === editing.id ? saved : c))
        );
      } else {
        setSharedCredentials((prev) => [saved, ...prev]);
      }
    } else if (editing) {
      setSharedCredentials((prev) =>
        prev.map((c) => (c.id === editing.id ? entry : c))
      );
    } else {
      setSharedCredentials((prev) => [entry, ...prev]);
    }

    toast.success(editing ? "Updated" : "Added", {
      description: cloudMode
        ? `${name} saved — your whole family can see it.`
        : `${name} has been saved on this device.`,
    });
    setDialogOpen(false);
    resetForm();
  }

  async function confirmDelete() {
    if (!deleteId) return;
    const cred = sharedCredentials.find((c) => c.id === deleteId);

    if (cloudMode) {
      const result = await removeCredential(deleteId);
      if (result.error) {
        toast.error("Could not delete", { description: result.error });
        setDeleteId(null);
        return;
      }
    }

    setSharedCredentials((prev) => prev.filter((c) => c.id !== deleteId));
    toast.success("Deleted", { description: `${cred?.name || "Item"} has been removed.` });
    setDeleteId(null);
  }

  const credToDelete = deleteId
    ? sharedCredentials.find((c) => c.id === deleteId)
    : null;

  function togglePasswordVisibility(id: string) {
    setVisiblePasswords((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

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

  const filtered = sharedCredentials.filter((cred) => {
    const matchesSearch =
      !search ||
      cred.name.toLowerCase().includes(search.toLowerCase()) ||
      cred.username?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || cred.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const grouped = filtered.reduce(
    (acc, cred) => {
      if (!acc[cred.category]) acc[cred.category] = [];
      acc[cred.category].push(cred);
      return acc;
    },
    {} as Record<CredentialCategory, SharedCredential[]>
  );

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Passwords & Logins
            </h1>
            <p className="mt-1 text-muted-foreground">
              Shared family passwords — WiFi, streaming, and everything in between.
            </p>
          </div>
          <Button onClick={openCreate} className="shrink-0 gap-2">
            <Plus className="h-4 w-4" />
            Add Login
          </Button>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search passwords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as CredentialCategory | "all")}
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Filter by category"
          >
            <option value="all">All Categories</option>
            {Object.entries(CREDENTIAL_CATEGORIES).map(([key, { label }]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Credentials List */}
        {filtered.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <KeyRound className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">
                {search || filterCategory !== "all" ? "No results found" : "No passwords saved yet"}
              </h3>
              <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
                {search || filterCategory !== "all"
                  ? "Try a different search term or clear your filters."
                  : "Add your WiFi password, streaming logins, or any account your family shares."}
              </p>
              {!search && filterCategory === "all" && (
                <Button onClick={openCreate} className="mt-6 gap-2">
                  <Plus className="h-4 w-4" />
                  Add Your First Login
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([cat, creds]) => {
              const catKey = cat as CredentialCategory;
              const Icon = categoryIcons[catKey];
              const colorClass = categoryColors[catKey];

              return (
                <div key={cat}>
                  <div className="mb-3 flex items-center gap-2">
                    <div className={cn("flex h-7 w-7 items-center justify-center rounded-lg", colorClass)}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <h2 className="text-sm font-semibold text-foreground">
                      {CREDENTIAL_CATEGORIES[catKey].label}
                    </h2>
                    <span className="text-xs text-muted-foreground">({creds.length})</span>
                  </div>

                  <StaggerContainer className="space-y-2">
                    <AnimatePresence mode="popLayout">
                      {creds.map((cred) => {
                        const isPasswordVisible = visiblePasswords.has(cred.id);
                        return (
                          <StaggerItem key={cred.id}>
                            <motion.div
                              layout
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                            >
                              <Card className="group transition-all hover:shadow-md">
                                <CardContent className="flex items-center gap-4 p-4">
                                  <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", colorClass)}>
                                    <Icon className="h-5 w-5" />
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <p className="font-semibold text-foreground truncate">
                                      {cred.name}
                                    </p>
                                    <div className="mt-0.5 flex flex-wrap items-center gap-x-4 gap-y-1">
                                      {cred.username && (
                                        <button
                                          onClick={() => copyToClipboard(cred.username!, `user-${cred.id}`)}
                                          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                                          title="Copy username"
                                        >
                                          {copiedId === `user-${cred.id}` ? (
                                            <Check className="h-3 w-3 text-green-500" />
                                          ) : (
                                            <Copy className="h-3 w-3" />
                                          )}
                                          {cred.username}
                                        </button>
                                      )}
                                      {cred.password && (
                                        <div className="flex items-center gap-1.5">
                                          <button
                                            onClick={() => togglePasswordVisibility(cred.id)}
                                            className="text-muted-foreground hover:text-foreground transition-colors"
                                            title={isPasswordVisible ? "Hide password" : "Show password"}
                                          >
                                            {isPasswordVisible ? (
                                              <EyeOff className="h-3 w-3" />
                                            ) : (
                                              <Eye className="h-3 w-3" />
                                            )}
                                          </button>
                                          <button
                                            onClick={() => copyToClipboard(cred.password!, `pw-${cred.id}`)}
                                            className="flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
                                            title="Copy password"
                                          >
                                            {copiedId === `pw-${cred.id}` ? (
                                              <Check className="h-3 w-3 text-green-500" />
                                            ) : (
                                              <Copy className="h-3 w-3" />
                                            )}
                                            {isPasswordVisible
                                              ? cred.password
                                              : "••••••••"}
                                          </button>
                                        </div>
                                      )}
                                      {cred.pin && (
                                        <button
                                          onClick={() => copyToClipboard(cred.pin!, `pin-${cred.id}`)}
                                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                                          title="Copy PIN"
                                        >
                                          {copiedId === `pin-${cred.id}` ? (
                                            <Check className="h-3 w-3 text-green-500" />
                                          ) : (
                                            <Copy className="h-3 w-3" />
                                          )}
                                          PIN: {isPasswordVisible ? cred.pin : "••••"}
                                        </button>
                                      )}
                                    </div>
                                    {cred.notes && (
                                      <p className="mt-1 text-xs text-muted-foreground/70 truncate">
                                        {cred.notes}
                                      </p>
                                    )}
                                  </div>

                                  <div className="flex shrink-0 gap-1 sm:opacity-60 sm:transition-opacity sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                                    <button
                                      onClick={() => openEdit(cred)}
                                      aria-label={`Edit ${cred.name}`}
                                      className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() => setDeleteId(cred.id)}
                                      aria-label={`Delete ${cred.name}`}
                                      className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          </StaggerItem>
                        );
                      })}
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
              <DialogTitle>{editing ? "Edit Login" : "Add a Login"}</DialogTitle>
              <DialogDescription>
                {editing
                  ? "Update this shared login."
                  : "Save a password or login your family shares."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="cred-name">Name *</Label>
                <Input
                  id="cred-name"
                  placeholder="e.g. Home WiFi, Netflix, Energy bill"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cred-category">Category</Label>
                <select
                  id="cred-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as CredentialCategory)}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                >
                  {Object.entries(CREDENTIAL_CATEGORIES).map(([key, { label }]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cred-username">Username / Email</Label>
                  <Input
                    id="cred-username"
                    placeholder="username or email"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="off"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cred-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="cred-password"
                      type={formPasswordVisible ? "text" : "password"}
                      placeholder="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="off"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setFormPasswordVisible((v) => !v)}
                      aria-label={formPasswordVisible ? "Hide password" : "Show password"}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                      {formPasswordVisible ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cred-url">Website URL</Label>
                  <Input
                    id="cred-url"
                    placeholder="https://..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cred-pin">PIN (optional)</Label>
                  <Input
                    id="cred-pin"
                    placeholder="e.g. 1234"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cred-notes">Notes (optional)</Label>
                <Textarea
                  id="cred-notes"
                  placeholder="Any extra details — e.g. 'password is on the router sticker'"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                />
              </div>

              <Button onClick={handleSave} className="w-full">
                {editing ? "Save Changes" : "Add Login"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <ConfirmDialog
          open={!!deleteId}
          onOpenChange={(open) => !open && setDeleteId(null)}
          title="Delete this login?"
          description={
            <>
              <strong className="text-foreground">{credToDelete?.name}</strong>{" "}
              and its password will be permanently removed. This cannot be undone.
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
