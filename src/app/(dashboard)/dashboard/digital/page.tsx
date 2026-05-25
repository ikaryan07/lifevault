"use client";

import { useState } from "react";
import { useVault } from "@/lib/store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Monitor, Plus, Globe, AlertTriangle, CheckCircle2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/motion/page-transition";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type AssetAction = "close" | "memorialize" | "transfer" | "keep";

const assetTypes = [
  "Email", "Social Media", "Banking / Finance", "Streaming",
  "Shopping", "Cloud Storage", "Work / Business", "Gaming",
  "Domain / Hosting", "Other",
];

const actionLabels: Record<AssetAction, string> = {
  close: "Close Account",
  memorialize: "Memorialise",
  transfer: "Transfer to Someone",
  keep: "Keep Active",
};

export default function DigitalAssetsPage() {
  const { digitalAssets, setDigitalAssets, isHydrated, cloudMode, upsertDigitalAsset, removeDigitalAsset } = useVault();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [url, setUrl] = useState("");
  const [username, setUsername] = useState("");
  const [action, setAction] = useState<AssetAction>("close");
  const [notes, setNotes] = useState("");

  function resetForm() {
    setName("");
    setType("");
    setUrl("");
    setUsername("");
    setAction("close");
    setNotes("");
  }

  async function handleAdd() {
    const trimmedName = name.trim();
    if (!trimmedName) { toast.error("Please enter an account name"); return; }

    const asset = {
      id: crypto.randomUUID(),
      name: trimmedName,
      type,
      url: url.trim(),
      username: username.trim(),
      action,
      notes: notes.trim(),
    };

    if (cloudMode) {
      const result = await upsertDigitalAsset(asset, true);
      if (result.error) {
        toast.error("Could not save", { description: result.error });
        return;
      }
      if (result.asset) {
        setDigitalAssets((prev) => [...prev, result.asset!]);
      }
    } else {
      setDigitalAssets((prev) => [...prev, asset]);
    }

    resetForm();
    setDialogOpen(false);
    toast.success("Account added", {
      description: `${trimmedName} has been saved to your online accounts.`,
      icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
    });
  }

  async function confirmDelete() {
    if (!deleteId) return;
    const asset = digitalAssets.find((a) => a.id === deleteId);

    if (cloudMode) {
      const result = await removeDigitalAsset(deleteId);
      if (result.error) {
        toast.error("Could not remove", { description: result.error });
        setDeleteId(null);
        return;
      }
    }

    setDigitalAssets((prev) => prev.filter((a) => a.id !== deleteId));
    toast.success("Account removed", {
      description: `${asset?.name} has been deleted.`,
    });
    setDeleteId(null);
  }

  const assetToDelete = deleteId
    ? digitalAssets.find((a) => a.id === deleteId)
    : null;

  if (!isHydrated) {
    return (
      <div className="flex h-64 items-center justify-center" role="status" aria-label="Loading">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Online Accounts
            </h1>
            <p className="mt-1 text-muted-foreground">
              Track your online accounts and what should happen to them.
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger render={<Button size="lg" />}>
              <Plus className="mr-2 h-4 w-4" />
              Add Account
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Online Account</DialogTitle>
                <DialogDescription>
                  Record the account details and what you&apos;d like done with it.
                  Don&apos;t store passwords here.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 pt-2">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="assetName">Account Name</Label>
                    <Input
                      id="assetName"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Gmail, Facebook"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="assetType">Type</Label>
                    <select
                      id="assetType"
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm"
                    >
                      <option value="">Select type...</option>
                      {assetTypes.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="assetUrl">Website</Label>
                    <Input
                      id="assetUrl"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="assetUsername">Username / Email</Label>
                    <Input
                      id="assetUsername"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>What should happen to this account?</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.entries(actionLabels) as [AssetAction, string][]).map(
                      ([key, label]) => (
                        <button
                          key={key}
                          onClick={() => setAction(key)}
                          className={`rounded-xl border px-3 py-3 text-sm font-medium transition-colors ${
                            action === key
                              ? "border-primary bg-primary/10 text-primary"
                              : "hover:bg-muted"
                          }`}
                        >
                          {label}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assetNotes">Notes</Label>
                  <Input
                    id="assetNotes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Password is in Bitwarden vault"
                  />
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  Don&apos;t store passwords here. Note where your password
                  manager can be found instead.
                </div>

                <Button className="w-full" size="lg" onClick={handleAdd} disabled={!name}>
                  Add Account
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {digitalAssets.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <Monitor className="h-10 w-10 text-primary" />
              </div>
              <h3 className="mt-5 text-xl font-semibold">No accounts yet</h3>
              <p className="mt-2 max-w-sm text-center text-base text-muted-foreground">
                Track your online accounts so your family knows what exists and
                what to do with each one.
              </p>
              <Button className="mt-6" size="lg" onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-5 w-5" />
                Add your first account
              </Button>
            </CardContent>
          </Card>
        ) : (
          <motion.div layout className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {digitalAssets.map((asset) => (
                <motion.div
                  key={asset.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Card className="relative">
                    <button
                      onClick={() => setDeleteId(asset.id)}
                      aria-label={`Delete ${asset.name}`}
                      className="absolute top-3 right-3 rounded-full p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:bg-destructive/10 focus-visible:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                          <Globe className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{asset.name}</CardTitle>
                          <CardDescription className="text-xs">
                            {asset.type}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {asset.username && (
                        <p className="text-sm text-muted-foreground">{asset.username}</p>
                      )}
                      {asset.url && (
                        <a
                          href={asset.url.startsWith("http") ? asset.url : `https://${asset.url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline truncate block"
                        >
                          {asset.url}
                        </a>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {actionLabels[asset.action]}
                      </Badge>
                      {asset.notes && (
                        <p className="text-xs text-muted-foreground">{asset.notes}</p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        <ConfirmDialog
          open={!!deleteId}
          onOpenChange={(open) => !open && setDeleteId(null)}
          title="Delete this account?"
          description={
            <>
              <strong className="text-foreground">{assetToDelete?.name}</strong>{" "}
              will be removed from your online accounts list.
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
