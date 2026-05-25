"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Shield, Heart, Clock, Users, Loader2 } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function VaultAccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <VaultAccessContent />
    </Suspense>
  );
}

function VaultAccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const ownerId = searchParams.get("id");
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [ownerName, setOwnerName] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function init() {
      if (!isSupabaseConfigured()) {
        setLoading(false);
        return;
      }
      const supabase = createClient();
      const { data: { user: u } } = await supabase.auth.getUser();
      setUser(u);

      if (ownerId) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("first_name, last_name")
          .eq("id", ownerId)
          .maybeSingle();
        if (profile) {
          setOwnerName(`${profile.first_name} ${profile.last_name}`.trim());
        }
      }
      setLoading(false);
    }
    init();
  }, [ownerId]);

  async function submitRequest() {
    if (!ownerId) {
      toast.error("Missing vault owner ID");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/vault-access/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vaultOwnerId: ownerId, reason: reason.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error("Request failed", { description: data.error });
        return;
      }
      toast.success("Access request submitted", {
        description: data.request?.status === "approved"
          ? "Access granted — you can view the vault now."
          : "Other trusted contacts will be asked to confirm.",
      });
      if (data.request?.status === "approved") {
        router.push(`/dashboard/granted-vault/${ownerId}`);
      } else {
        router.push("/dashboard/vault-access");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-2xl">HomePin Access Request</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-muted-foreground">
            If someone you love has passed away or become incapacitated, you can request
            access to their HomePin vault. This process is secure and requires confirmation
            from other trusted contacts.
          </p>

          {ownerName && (
            <div className="rounded-lg border bg-muted/40 p-3 text-center text-sm">
              Requesting access to <strong>{ownerName}&apos;s</strong> vault
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-lg border p-3">
              <Users className="h-5 w-5 shrink-0 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium">You must be a trusted contact</p>
                <p className="text-xs text-muted-foreground">Only invited and accepted contacts can request access.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border p-3">
              <Clock className="h-5 w-5 shrink-0 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium">Multi-person confirmation</p>
                <p className="text-xs text-muted-foreground">At least 2 other trusted contacts must confirm.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border p-3">
              <Heart className="h-5 w-5 shrink-0 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium">Up to 7-day waiting period</p>
                <p className="text-xs text-muted-foreground">Access is granted after confirmations are received.</p>
              </div>
            </div>
          </div>

          {user && ownerId ? (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for request (optional)</Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Briefly explain why you need access..."
                  rows={3}
                />
              </div>
              <Button className="w-full" size="lg" onClick={submitRequest} disabled={submitting}>
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Request vault access
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Link href={`/login?next=${encodeURIComponent(`/vault-access?id=${ownerId || ""}`)}`} className={cn(buttonVariants({ size: "lg" }), "w-full")}>
                Sign in to request access
              </Link>
              <Link href="/signup" className={cn(buttonVariants({ variant: "outline" }), "w-full")}>
                Create an account first
              </Link>
            </div>
          )}

          <p className="text-center text-xs text-muted-foreground">
            Need help?{" "}
            <a href="mailto:support@homepin.com.au" className="text-primary hover:underline">
              support@homepin.com.au
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
