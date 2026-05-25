"use client";

import { useEffect, useState } from "react";
import { fetchPendingVaultAccessRequests } from "@/lib/actions/legacy-vault";
import { PageTransition } from "@/components/motion/page-transition";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

type RequestRow = Awaited<ReturnType<typeof fetchPendingVaultAccessRequests>>[number];

export default function VaultAccessRequestsPage() {
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingVaultAccessRequests()
      .then(setRequests)
      .finally(() => setLoading(false));
  }, []);

  async function confirm(requestId: string, confirmed: boolean) {
    setActing(requestId);
    try {
      const res = await fetch("/api/vault-access/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, confirmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error("Could not submit response", { description: data.error });
        return;
      }
      toast.success(confirmed ? "Request confirmed" : "Request denied");
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
    } finally {
      setActing(null);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Vault access requests</h1>
          <p className="mt-1 text-muted-foreground">
            Review and confirm requests from trusted contacts who need access to a vault.
          </p>
        </div>

        {requests.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center py-12 text-center">
              <Shield className="h-10 w-10 text-muted-foreground" />
              <p className="mt-3 font-medium">No pending requests</p>
              <p className="mt-1 text-sm text-muted-foreground">
                When someone requests vault access, it will appear here for confirmation.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <Card key={req.id}>
                <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold">{req.requesterName} requested access</p>
                    <p className="text-sm text-muted-foreground">
                      Vault: {req.ownerName} · {req.confirmationsReceived}/{req.confirmationsNeeded} confirmations
                    </p>
                    {req.reason && (
                      <p className="mt-2 text-sm text-muted-foreground">&ldquo;{req.reason}&rdquo;</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={acting === req.id}
                      onClick={() => confirm(req.id, false)}
                    >
                      <X className="mr-1 h-4 w-4" />
                      Deny
                    </Button>
                    <Button
                      size="sm"
                      disabled={acting === req.id}
                      onClick={() => confirm(req.id, true)}
                    >
                      <Check className="mr-1 h-4 w-4" />
                      Confirm
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <p className="text-sm text-muted-foreground">
          Learn more about how access works on our{" "}
          <Link href="/how-access" className="text-primary hover:underline">
            How access works
          </Link>{" "}
          page.
        </p>
      </div>
    </PageTransition>
  );
}
