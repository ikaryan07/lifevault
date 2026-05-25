"use client";

import { useRef, useEffect, useState } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Printer, Shield, Info } from "lucide-react";
import { PageTransition } from "@/components/motion/page-transition";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { useVault } from "@/lib/store";

export default function EmergencyCardPage() {
  const cardRef = useRef<HTMLDivElement>(null);
  const { profile } = useVault();
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    async function loadUser() {
      if (!isSupabaseConfigured()) {
        if (profile) {
          setUserName(
            `${profile.firstName || ""} ${profile.lastName || ""}`.trim() ||
              "Your name here"
          );
        } else {
          setUserName("Your name here");
        }
        setUserId("demo");
        return;
      }

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data: dbProfile } = await supabase
          .from("profiles")
          .select("first_name, last_name")
          .eq("id", user.id)
          .single();
        if (dbProfile) {
          setUserName(
            `${dbProfile.first_name || ""} ${dbProfile.last_name || ""}`.trim()
          );
        }
      }
    }
    loadUser();
  }, [profile]);

  function handlePrint() {
    window.print();
  }

  const origin = typeof window !== "undefined" ? window.location.origin : "https://homepin.com.au";
  const qrUrl = `${origin}/vault-access?id=${userId}`;
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    if (!userId) return;
    QRCode.toDataURL(qrUrl, { width: 240, margin: 1 }).then(setQrDataUrl).catch(() => {});
  }, [qrUrl, userId]);

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Emergency Access Card</h1>
          <p className="mt-1 text-muted-foreground">
            Print this card and keep it in your wallet or give it to your trusted contacts.
            It contains instructions for accessing your vault — no sensitive data.
          </p>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/20 dark:bg-amber-500/5">
          <div className="flex gap-3">
            <Info className="h-5 w-5 shrink-0 text-amber-600" />
            <div className="text-sm text-amber-800 dark:text-amber-300">
              <p className="font-medium">What this card does:</p>
              <ul className="mt-1 list-disc space-y-0.5 pl-4">
                <li>Links to a page explaining how to request vault access</li>
                <li>Does NOT contain any passwords or documents</li>
                <li>Access still requires confirmation from multiple trusted contacts</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Printable Card */}
        <div ref={cardRef} className="print-card">
          <Card className="mx-auto max-w-md border-2 shadow-lg print:border print:shadow-none">
            <CardContent className="space-y-6 p-8 text-center">
              <div className="flex items-center justify-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">HomePin</span>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Emergency Access Card for</p>
                <p className="mt-1 text-lg font-bold">{userName || "Loading..."}</p>
              </div>

              <div className="mx-auto flex h-60 w-60 items-center justify-center rounded-lg border bg-white p-3">
                {qrDataUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={qrDataUrl}
                    alt="QR code linking to vault access page"
                    className="h-full w-full"
                    width={240}
                    height={240}
                  />
                ) : (
                  <div className="h-full w-full animate-pulse rounded bg-muted" />
                )}
              </div>

              <div className="space-y-2 text-left text-sm">
                <p className="font-semibold">If something has happened to me:</p>
                <ol className="list-decimal space-y-1 pl-5 text-muted-foreground">
                  <li>Scan the QR code above with your phone&apos;s camera</li>
                  <li>Click &ldquo;Request Vault Access&rdquo;</li>
                  <li>Other trusted contacts will be asked to confirm</li>
                  <li>Once confirmed, you&apos;ll receive access to my documents</li>
                </ol>
              </div>

              <div className="border-t pt-4">
                <p className="break-all text-[10px] text-muted-foreground">
                  Or visit: {qrUrl}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  homepin.com.au &middot; Secure planning for Australian families
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center gap-3">
          <Button onClick={handlePrint} size="lg">
            <Printer className="mr-2 h-4 w-4" />
            Print Card
          </Button>
        </div>

        <style jsx global>{`
          @media print {
            body * {
              visibility: hidden;
            }
            .print-card,
            .print-card * {
              visibility: visible;
            }
            .print-card {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
          }
        `}</style>
      </div>
    </PageTransition>
  );
}
