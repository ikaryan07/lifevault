"use client";

import { useEffect, useState } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

export function MfaSettings() {
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    async function load() {
      if (!isSupabaseConfigured()) {
        setLoading(false);
        return;
      }
      const supabase = createClient();
      const { data } = await supabase.auth.mfa.listFactors();
      const verified = data?.totp?.some((f) => f.status === "verified") ?? false;
      setEnabled(verified);
      setLoading(false);
    }
    load();
  }, []);

  async function startEnroll() {
    if (!isSupabaseConfigured()) return;
    setEnrolling(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "Authenticator app",
    });
    if (error) {
      toast.error("Could not start 2FA setup", { description: error.message });
      setEnrolling(false);
      return;
    }
    setFactorId(data.id);
    setQrCode(data.totp.qr_code);
    setEnrolling(false);
  }

  async function confirmEnroll() {
    if (!factorId || !verifyCode.trim()) return;
    const supabase = createClient();
    const { data: challenge, error: cErr } = await supabase.auth.mfa.challenge({ factorId });
    if (cErr) {
      toast.error("Challenge failed", { description: cErr.message });
      return;
    }
    const { error } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code: verifyCode.trim(),
    });
    if (error) {
      toast.error("Invalid code", { description: "Check your authenticator app and try again." });
      return;
    }
    setEnabled(true);
    setFactorId(null);
    setQrCode(null);
    setVerifyCode("");
    toast.success("Two-factor authentication enabled");
  }

  async function disableMfa() {
    const supabase = createClient();
    const { data } = await supabase.auth.mfa.listFactors();
    const factor = data?.totp?.find((f) => f.status === "verified");
    if (!factor) return;
    const { error } = await supabase.auth.mfa.unenroll({ factorId: factor.id });
    if (error) {
      toast.error("Could not disable 2FA", { description: error.message });
      return;
    }
    setEnabled(false);
    toast.success("Two-factor authentication disabled");
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading security settings...
      </div>
    );
  }

  if (!isSupabaseConfigured()) {
    return <Badge variant="secondary">Requires cloud login</Badge>;
  }

  if (enabled) {
    return (
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-green-600" />
          <Badge className="bg-green-600/10 text-green-700 dark:text-green-400">Enabled</Badge>
        </div>
        <Button variant="outline" size="sm" onClick={disableMfa}>
          Disable 2FA
        </Button>
      </div>
    );
  }

  if (qrCode && factorId) {
    return (
      <div className="space-y-4 rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">
          Scan this QR code with Google Authenticator, Authy, or 1Password.
        </p>
        <div className="flex justify-center">
          <Image src={qrCode} alt="2FA QR code" width={180} height={180} unoptimized />
        </div>
        <div className="space-y-2">
          <Label htmlFor="mfa-code">Enter 6-digit code</Label>
          <Input
            id="mfa-code"
            inputMode="numeric"
            maxLength={6}
            value={verifyCode}
            onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ""))}
            placeholder="000000"
          />
        </div>
        <Button onClick={confirmEnroll} disabled={verifyCode.length < 6}>
          Verify and enable
        </Button>
      </div>
    );
  }

  return (
    <Button variant="outline" size="sm" onClick={startEnroll} disabled={enrolling}>
      {enrolling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      Set up 2FA
    </Button>
  );
}
