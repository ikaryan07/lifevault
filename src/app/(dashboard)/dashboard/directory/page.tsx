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
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BookUser, Plus, Mail, Phone, Building2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface Contact {
  id: string;
  name: string;
  role: string;
  organization: string;
  phone: string;
  email: string;
  notes: string;
}

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
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [organization, setOrganization] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  function handleAdd() {
    if (!name || !role) return;
    setContacts((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name, role, organization, phone, email, notes },
    ]);
    const addedName = name;
    setName("");
    setRole("");
    setOrganization("");
    setPhone("");
    setEmail("");
    setNotes("");
    setDialogOpen(false);
    toast.success("Contact saved", {
      description: `${addedName} has been added to your important contacts.`,
      icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Important Contacts
          </h1>
          <p className="mt-1 text-muted-foreground">
            Key professionals and service providers your family may need to contact.
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button />}>
            <Plus className="mr-2 h-4 w-4" />
            Add Contact
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Important Contact</DialogTitle>
              <DialogDescription>
                Record details of professionals and service providers your family
                might need.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Role / Type</Label>
                <div className="flex flex-wrap gap-2">
                  {suggestedRoles.map((r) => (
                    <button
                      key={r}
                      onClick={() => setRole(r)}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
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
                  <Input
                    id="dirName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dirOrg">Organisation</Label>
                  <Input
                    id="dirOrg"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="Company or firm"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="dirPhone">Phone</Label>
                  <Input
                    id="dirPhone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dirEmail">Email</Label>
                  <Input
                    id="dirEmail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dirNotes">Notes (optional)</Label>
                <Textarea
                  id="dirNotes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional details..."
                  rows={2}
                />
              </div>

              <Button className="w-full" onClick={handleAdd} disabled={!name || !role}>
                Add Contact
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {contacts.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <BookUser className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No contacts yet</h3>
            <p className="mt-1 text-center text-sm text-muted-foreground">
              Add your solicitor, accountant, doctor, and other
              <br />
              key contacts your family may need.
            </p>
            <Button className="mt-6" onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add your first contact
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {contacts.map((contact) => (
            <Card key={contact.id}>
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
                  <p className="mt-2 text-xs text-muted-foreground">
                    {contact.notes}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
