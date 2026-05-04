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
import { UserPlus, Users, Shield, Mail, Phone, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

type AccessRole = "full_access" | "limited_access" | "on_death_only";

interface LocalContact {
  id: string;
  name: string;
  email: string;
  phone: string;
  relationship: string;
  role: AccessRole;
  status: "pending" | "accepted";
}

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
  const [contacts, setContacts] = useState<LocalContact[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [relationship, setRelationship] = useState("");
  const [role, setRole] = useState<AccessRole>("on_death_only");

  function handleAdd() {
    if (!name || !email) return;

    setContacts((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name,
        email,
        phone,
        relationship,
        role,
        status: "pending",
      },
    ]);

    setName("");
    setEmail("");
    setPhone("");
    setRelationship("");
    setRole("on_death_only");
    setDialogOpen(false);
    toast.success("Contact added", {
      description: `An invitation will be sent to ${email}.`,
      icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
    });
  }

  return (
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

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button />}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Contact
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Trusted Contact</DialogTitle>
              <DialogDescription>
                They&apos;ll receive an invitation to connect with your vault.
                You control what they can access and when.
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
                <Label>Access Level</Label>
                <div className="space-y-2">
                  {(Object.entries(roleLabels) as [AccessRole, { label: string; description: string }][]).map(
                    ([key, { label, description }]) => (
                      <button
                        key={key}
                        onClick={() => setRole(key)}
                        className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors ${
                          role === key
                            ? "border-primary bg-primary/5"
                            : "hover:bg-muted"
                        }`}
                      >
                        <div
                          className={`mt-0.5 h-4 w-4 rounded-full border-2 ${
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

              <div className="flex items-center gap-2 rounded-lg bg-primary/5 p-3 text-xs text-primary">
                <Shield className="h-4 w-4 shrink-0" />
                Their access is cryptographically secured. They cannot access
                your vault until conditions are met.
              </div>

              <Button className="w-full" onClick={handleAdd} disabled={!name || !email}>
                Send Invitation
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {contacts.length === 0 ? (
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
            <Button className="mt-6" size="lg" onClick={() => setDialogOpen(true)}>
              <UserPlus className="mr-2 h-5 w-5" />
              Add a trusted person
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {contacts.map((contact) => (
            <Card key={contact.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{contact.name}</CardTitle>
                    <CardDescription>{contact.relationship}</CardDescription>
                  </div>
                  <Badge
                    variant={
                      contact.status === "accepted" ? "default" : "secondary"
                    }
                  >
                    {contact.status === "accepted" ? "Connected" : "Pending"}
                  </Badge>
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
                <div className="mt-2">
                  <Badge variant="outline" className="text-xs">
                    {roleLabels[contact.role].label}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
