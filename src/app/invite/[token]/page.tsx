import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Shield, Check, X } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = await createClient();

  const { data: contact } = await supabase
    .from("trusted_contacts")
    .select("*, profiles!trusted_contacts_user_id_fkey(first_name, last_name)")
    .eq("invitation_token", token)
    .single();

  if (!contact) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <X className="mx-auto h-12 w-12 text-destructive" />
            <h2 className="mt-4 text-xl font-bold">Invalid Invitation</h2>
            <p className="mt-2 text-muted-foreground">
              This invitation link is invalid or has already been used.
            </p>
            <Link href="/" className={cn(buttonVariants({ variant: "outline" }), "mt-4")}>
              Go to LifeVault
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const ownerName = contact.profiles
    ? `${contact.profiles.first_name} ${contact.profiles.last_name}`
    : "Someone";

  const alreadyAccepted = contact.invitation_status === "accepted";

  if (alreadyAccepted) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <Check className="mx-auto h-12 w-12 text-green-600" />
            <h2 className="mt-4 text-xl font-bold">Already Accepted</h2>
            <p className="mt-2 text-muted-foreground">
              You&apos;ve already accepted this invitation from {ownerName}.
            </p>
            <Link href="/login" className={cn(buttonVariants(), "mt-4")}>
              Sign in to LifeVault
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-xl">You&apos;ve been trusted</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            <strong>{ownerName}</strong> has added you as a trusted contact on LifeVault.
            This means they trust you to help manage their important documents when the time comes.
          </p>
          <div className="rounded-lg border bg-muted/50 p-3 text-sm">
            <p><strong>Your access level:</strong> {contact.access_level.replace(/_/g, " ")}</p>
            {contact.relationship && <p><strong>Relationship:</strong> {contact.relationship}</p>}
          </div>
          <form action={`/api/invite/${token}/accept`} method="POST">
            <Button type="submit" className="w-full" size="lg">
              <Check className="mr-2 h-4 w-4" />
              Accept Invitation
            </Button>
          </form>
          <p className="text-center text-xs text-muted-foreground">
            If you don&apos;t recognise this person, simply ignore this page.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
