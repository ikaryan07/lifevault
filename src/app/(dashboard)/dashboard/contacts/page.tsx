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
} from "@/components/ui/dialog";
import { UserPlus, Users, Shield, Mail, Phone, CheckCircle2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/motion/page-transition";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { TrustedContact } from "@/types";

type AccessRole = "full_access" | "limited_access" | "on_death_only";

const roleLabels: Record<AccessRole, { label: string; description: string }> = {
  full_access: {
    label: "Full Access",
    description: "Can view all documents immediately",
  },
  limited_access: {
    label: "Limited Access",
    description: "Can view select categories only",
  },
  on_death_only: {
    label: "After Death Only",
    description: "Access unlocked only after death trigger is confirmed",
  },
};

export default function ContactsPage() {
  const { trustedContacts, setTrustedContacts, plan, isHydrated } = useVault();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [relationship, setRelationship] = useState("");
  const [role, setRole] = useState<AccessRole>("on_death_only");

  const atLimit = isFinite(plan.limits.trustedContacts) && trustedContacts.length >= plan.limits.trustedContacts;

  function tryOpenAdd() {
    if (atLimit) {
      toast.error(`${plan.name} plan limit reached`, {
        description: `Upgrade your plan to add more than ${plan.limits.trustedContacts} trusted contact${plan.limits.trustedContacts === 1 ? "" : "s"}.`,
        action: { label: "Upgrade", onClick: () => window.location.assign("/dashboard/settings/plan") },
      });
      return;
    }
    resetForm();
    setDialogOpen(true);
  }

  function resetForm() {
    setName("");
    setEmail("");
    setPhone("");
    setRelationship("");
    setRole("on_death_only");
  }

  function handleAdd() {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    if (!trimmedName) { toast.error("Please enter a name"); return; }
    if (!trimmedEmail) { toast.error("Please enter an email address"); return; }

    const newContact: TrustedContact = {
      id: crypto.randomUUID(),
      user_id: "",
      name: trimmedName,
      email: trimmedEmail,
      phone: phone.trim() || undefined,
      relationship: relationship.trim(),
      role,
      access_granted: false,
      invited_at: new Date().toISOString(),
    };

    setTrustedContacts((prev) => [...prev, newContact]);
    const addedName = name;
    resetForm();
    setDialogOpen(false);
    toast.success("Contact added", {
      description: `${addedName} has been added as a trusted person.`,
      icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
    });
  }

  function confirmDelete() {
    if (!deleteId) return;
    const contact = trustedContacts.find((c) => c.id === deleteId);
    setTrustedContacts((prev) => prev.filter((c) => c.id !== deleteId));
    toast.success("Contact removed", {
      description: `${contact?.name} has been removed.`,
    });
    setDeleteId(null);
  }

  const contactToDelete = deleteId
    ? trustedContacts.find((c) => c.id === deleteId)
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
              Your Trusted People
            </h1>
            <p className="mt-1 text-muted-foreground">
              Family or friends who can access your vault when the time comes.
            </p>
          </div>

          <Button size="lg" onClick={tryOpenAdd}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Person
          </Button>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add a Trusted Person</DialogTitle>
                <DialogDescription>
                  Add someone you trust to access your vault. You control what
                  they can see and when. We&apos;ll prompt you to send an
                  invitation once your account is connected.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 pt-2">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contactName">Full Name</Label>
                    <Input
                      id="contactName"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Smith"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactRelationship">Relationship</Label>
                    <Input
                      id="contactRelationship"
                      value={relationship}
                      onChange={(e) => setRelationship(e.target.value)}
                      placeholder="e.g. Daughter, Solicitor"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Phone (optional)</Label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="04XX XXX XXX"
                  />
                </div>

                <div className="space-y-2">
                  <Label id="role-group-label">When can they access your vault?</Label>
                  <div className="space-y-2" role="radiogroup" aria-labelledby="role-group-label">
                    {(Object.entries(roleLabels) as [AccessRole, { label: string; description: string }][]).map(
                      ([key, { label, description }]) => (
                        <button
                          key={key}
                          onClick={() => setRole(key)}
                          role="radio"
                          aria-checked={role === key}
                          className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-colors ${
                            role === key
                              ? "border-primary bg-primary/5"
                              : "hover:bg-muted"
                          }`}
                        >
                          <div
                            className={`mt-0.5 h-4 w-4 rounded-full border-2 transition-colors ${
                              role === key
                                ? "border-primary bg-primary"
                                : "border-muted-foreground/30"
                            }`}
                          />
                          <div>
                            <p className="text-sm font-medium">{label}</p>
                            <p className="text-xs text-muted-foreground">
                              {description}
                            </p>
                          </div>
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-primary/5 p-3 text-sm text-primary">
                  <Shield className="h-4 w-4 shrink-0" />
                  Their access is cryptographically secured.
                </div>

                <Button className="w-full" size="lg" onClick={handleAdd} disabled={!name || !email}>
                  Add Trusted Person
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {trustedContacts.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-10 w-10 text-primary" />
              </div>
              <h3 className="mt-5 text-xl font-semibold">
                Who should have access?
              </h3>
              <p className="mt-2 max-w-sm text-center text-base text-muted-foreground">
                Think of someone your family would turn to — a partner, a child,
                or your solicitor. You decide exactly what they can see.
              </p>
              <Button className="mt-6" size="lg" onClick={tryOpenAdd}>
                <UserPlus className="mr-2 h-5 w-5" />
                Add a trusted person
              </Button>
            </CardContent>
          </Card>
        ) : (
          <motion.div layout className="grid gap-4 sm:grid-cols-2">
            <AnimatePresence>
              {trustedContacts.map((contact) => (
                <motion.div
                  key={contact.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Card className="relative">
                    <button
                      onClick={() => setDeleteId(contact.id)}
                      aria-label={`Remove ${contact.name}`}
                      className="absolute top-3 right-3 rounded-full p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:bg-destructive/10 focus-visible:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                          {contact.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                        <div>
                          <CardTitle className="text-base">{contact.name}</CardTitle>
                          <CardDescription>{contact.relationship}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-3.5 w-3.5" />
                        {contact.email}
                      </div>
                      {contact.phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-3.5 w-3.5" />
                          {contact.phone}
                        </div>
                      )}
                      <div className="mt-3 flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {roleLabels[contact.role].label}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {contact.accepted_at ? "Connected" : "Invited"}
                        </Badge>
                      </div>
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
          title="Remove trusted person?"
          description={
            <>
              <strong className="text-foreground">{contactToDelete?.name}</strong>{" "}
              will no longer have access to your vault. You can add them back
              at any time.
            </>
          }
          confirmLabel="Yes, remove"
          variant="destructive"
          onConfirm={confirmDelete}
        />
      </div>
    </PageTransition>
  );
}
