"use client";

import { useState } from "react";
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
import { Monitor, Plus, Globe, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

type AssetAction = "close" | "memorialize" | "transfer" | "keep";

interface DigitalAsset {
  id: string;
  name: string;
  type: string;
  url: string;
  username: string;
  action: AssetAction;
  notes: string;
}

const assetTypes = [
  "Email",
  "Social Media",
  "Banking / Finance",
  "Streaming",
  "Shopping",
  "Cloud Storage",
  "Work / Business",
  "Gaming",
  "Domain / Hosting",
  "Other",
];

const actionLabels: Record<AssetAction, string> = {
  close: "Close Account",
  memorialize: "Memorialise",
  transfer: "Transfer to Someone",
  keep: "Keep Active",
};

export default function DigitalAssetsPage() {
  const [assets, setAssets] = useState<DigitalAsset[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [url, setUrl] = useState("");
  const [username, setUsername] = useState("");
  const [action, setAction] = useState<AssetAction>("close");
  const [notes, setNotes] = useState("");

  function handleAdd() {
    if (!name) return;
    setAssets((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name, type, url, username, action, notes },
    ]);
    const addedName = name;
    setName("");
    setType("");
    setUrl("");
    setUsername("");
    setAction("close");
    setNotes("");
    setDialogOpen(false);
    toast.success("Account added", {
      description: `${addedName} has been saved to your digital assets.`,
      icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Digital Assets
          </h1>
          <p className="mt-1 text-muted-foreground">
            Track your online accounts and what should happen to them.
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button />}>
            <Plus className="mr-2 h-4 w-4" />
            Add Account
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Digital Account</DialogTitle>
              <DialogDescription>
                Record the account details and what you&apos;d like done with it.
                Don&apos;t store passwords here — note where your password
                manager is instead.
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
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                  >
                    <option value="">Select type...</option>
                    {assetTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="assetUrl">Website URL</Label>
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
                        className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
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

              <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 p-3 text-xs text-amber-700">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                Don&apos;t store passwords here. Instead, note where your password
                manager can be found.
              </div>

              <Button className="w-full" onClick={handleAdd} disabled={!name}>
                Add Account
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {assets.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Monitor className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No digital assets</h3>
            <p className="mt-1 text-center text-sm text-muted-foreground">
              Track your online accounts so your family knows
              <br />
              what exists and what to do with each one.
            </p>
            <Button className="mt-6" onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add your first account
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {assets.map((asset) => (
            <Card key={asset.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Globe className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{asset.name}</CardTitle>
                      <CardDescription className="text-xs">
                        {asset.type}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {asset.username && (
                  <p className="text-sm text-muted-foreground">
                    {asset.username}
                  </p>
                )}
                <Badge variant="outline" className="text-xs">
                  {actionLabels[asset.action]}
                </Badge>
                {asset.notes && (
                  <p className="text-xs text-muted-foreground">{asset.notes}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
