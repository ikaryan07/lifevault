"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchGrantedVaultData } from "@/lib/actions/legacy-vault";
import { PageTransition } from "@/components/motion/page-transition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, FileText, Loader2 } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function GrantedVaultPage() {
  const params = useParams();
  const ownerId = params.ownerId as string;
  const [data, setData] = useState<Awaited<ReturnType<typeof fetchGrantedVaultData>>>(null);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    fetchGrantedVaultData(ownerId)
      .then((d) => {
        if (!d) setDenied(true);
        else setData(d);
      })
      .finally(() => setLoading(false));
  }, [ownerId]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (denied || !data) {
    return (
      <PageTransition>
        <Card className="max-w-lg mx-auto">
          <CardContent className="py-10 text-center">
            <Shield className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 font-medium">Access not granted</p>
            <p className="mt-1 text-sm text-muted-foreground">
              You don&apos;t have approved access to this vault yet.
            </p>
            <Link href="/vault-access" className={cn(buttonVariants(), "mt-4 inline-flex")}>
              Request access
            </Link>
          </CardContent>
        </Card>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Granted vault access</h1>
          <p className="mt-1 text-muted-foreground">
            Read-only view of documents and key contacts shared after access was approved.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Documents ({data.documents.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.documents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No documents in this vault.</p>
            ) : (
              data.documents.map((doc) => (
                <div key={doc.id} className="flex items-center gap-2 rounded-lg border p-3 text-sm">
                  <FileText className="h-4 w-4 text-primary" />
                  <span>{doc.title}</span>
                  <span className="text-muted-foreground">({doc.category})</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Key contacts ({data.importantContacts.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.importantContacts.map((c) => (
              <div key={c.id} className="rounded-lg border p-3 text-sm">
                <p className="font-medium">{c.name}</p>
                <p className="text-muted-foreground">{c.role}{c.organization ? ` · ${c.organization}` : ""}</p>
                {c.phone && <p className="text-muted-foreground">{c.phone}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
