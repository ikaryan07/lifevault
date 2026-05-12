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
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BookUser, Plus, Mail, Phone, Building2, CheckCircle2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/motion/page-transition";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { ImportantContact } from "@/types";

const suggestedRoles = [
  "Solicitor / Lawyer",
  "Accountant",
  "Financial Advisor",
  "Doctor / GP",
  "Funeral Director",
  "Insurance Agent",
  "Bank Manager",
  "Employer / HR",
];

export default function DirectoryPage() {
  const { importantContacts, setImportantContacts, isHydrated } = useVault();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [organization, setOrganization] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  function resetForm() {
    setName("");
    setRole("");
    setOrganization("");
    setPhone("");
    setEmail("");
    setNotes("");
  }

  function handleAdd() {
    const trimmedName = name.trim();
    const trimmedRole = role.trim();
    if (!trimmedName) { toast.error("Please enter a name"); return; }
    if (!trimmedRole) { toast.error("Please enter a role (e.g. Solicitor)"); return; }
    const addedName = trimmedName;
    const newContact: ImportantContact = {
      id: crypto.randomUUID(),
      user_id: "",
      name: trimmedName,
      role: trimmedRole,
      organization: organization.trim() || undefined,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      notes: notes.trim() || undefined,
    };
    setImportantContacts((prev) => [...prev, newContact]);
    resetForm();
    setDialogOpen(false);
    toast.success("Contact saved", {
      description: `${addedName} has been added to your key contacts.`,
      icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
    });
  }

  function confirmDelete() {
    if (!deleteId) return;
    const contact = importantContacts.find((c) => c.id === deleteId);
    setImportantContacts((prev) => prev.filter((c) => c.id !== deleteId));
    toast.success("Contact removed", {
      description: `${contact?.name} has been deleted.`,
    });
    setDeleteId(null);
  }

  const contactToDelete = deleteId
    ? importantContacts.find((c) => c.id === deleteId)
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
              Key Contacts
            </h1>
            <p className="mt-1 text-muted-foreground">
              Professionals and service providers your family may need to reach.
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger render={<Button size="lg" />}>
              <Plus className="mr-2 h-4 w-4" />
              Add Contact
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Key Contact</DialogTitle>
                <DialogDescription>
                  Record details of professionals your family might need.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>What type of contact?</Label>
                  <div className="flex flex-wrap gap-2">
                    {suggestedRoles.map((r) => (
                      <button
                        key={r}
                        onClick={() => setRole(r)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                          role === r
                            ? "border-primary bg-primary/10 text-primary"
                            : "hover:bg-muted"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                  <Input
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="Or type a custom role..."
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="dirName">Name</Label>
                    <Input id="dirName" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dirOrg">Organisation</Label>
                    <Input id="dirOrg" value={organization} onChange={(e) => setOrganization(e.target.value)} placeholder="Company or firm" />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="dirPhone">Phone</Label>
                    <Input id="dirPhone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dirEmail">Email</Label>
                    <Input id="dirEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dirNotes">Notes (optional)</Label>
                  <Textarea id="dirNotes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any additional details..." rows={2} />
                </div>

                <Button className="w-full" size="lg" onClick={handleAdd} disabled={!name || !role}>
                  Save Contact
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {importantContacts.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <BookUser className="h-10 w-10 text-primary" />
              </div>
              <h3 className="mt-5 text-xl font-semibold">No contacts yet</h3>
              <p className="mt-2 max-w-sm text-center text-base text-muted-foreground">
                Add your solicitor, accountant, doctor, and other key contacts
                your family may need.
              </p>
              <Button className="mt-6" size="lg" onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-5 w-5" />
                Add your first contact
              </Button>
            </CardContent>
          </Card>
        ) : (
          <motion.div layout className="grid gap-4 sm:grid-cols-2">
            <AnimatePresence>
              {importantContacts.map((contact) => (
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
                      aria-label={`Delete ${contact.name}`}
                      className="absolute top-3 right-3 rounded-full p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:bg-destructive/10 focus-visible:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">{contact.name}</CardTitle>
                      <CardDescription>{contact.role}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {contact.organization && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Building2 className="h-3.5 w-3.5" />
                          {contact.organization}
                        </div>
                      )}
                      {contact.phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-3.5 w-3.5" />
                          {contact.phone}
                        </div>
                      )}
                      {contact.email && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-3.5 w-3.5" />
                          {contact.email}
                        </div>
                      )}
                      {contact.notes && (
                        <p className="mt-2 text-xs text-muted-foreground">{contact.notes}</p>
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
          title="Delete this contact?"
          description={
            <>
              <strong className="text-foreground">{contactToDelete?.name}</strong>{" "}
              will be removed from your key contacts.
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
