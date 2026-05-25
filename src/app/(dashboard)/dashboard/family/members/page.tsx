"use client";

import { useEffect, useState } from "react";
import { useVault } from "@/lib/store";
import { getFamilyInfo, updateFamilyName } from "@/lib/actions/family-hub";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { PageTransition } from "@/components/motion/page-transition";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Copy, Check, Crown, Link2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import type { FamilyInfo } from "@/lib/actions/family-hub";
import { joinFamilyUrl } from "@/lib/auth/site-url";

export default function FamilyMembersPage() {
  const { cloudMode, family: contextFamily, refreshCloud } = useVault();
  const [family, setFamily] = useState<FamilyInfo | null>(contextFamily);
  const [familyName, setFamilyName] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!isSupabaseConfigured()) {
        setLoading(false);
        return;
      }
      const { family: f } = await getFamilyInfo();
      setFamily(f);
      if (f) setFamilyName(f.name);
      setLoading(false);
    }
    load();
  }, [contextFamily]);

  if (!isSupabaseConfigured()) {
    return (
      <PageTransition>
        <Card>
          <CardHeader>
            <CardTitle>Family sharing requires cloud setup</CardTitle>
            <CardDescription>
              Follow SETUP.md to connect Supabase. Then mum, partner, and kids can all see the
              same passwords and household info.
            </CardDescription>
          </CardHeader>
        </Card>
      </PageTransition>
    );
  }

  if (loading) {
    return (
      <PageTransition>
        <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </PageTransition>
    );
  }

  const inviteUrl = family ? joinFamilyUrl(family.inviteCode) : "";

  async function copyInvite() {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      toast.success("Invite link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy link");
    }
  }

  async function saveFamilyName() {
    const result = await updateFamilyName(familyName);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Family name updated");
    await refreshCloud();
    const { family: f } = await getFamilyInfo();
    setFamily(f);
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Family members</h1>
          <p className="mt-1 text-muted-foreground">
            Everyone in your family sees the same passwords and household info. Mum adds the
            WiFi — the kids see it instantly.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-primary" />
              Invite your family
            </CardTitle>
            <CardDescription>
              Send this link to your partner or kids. They create an account (or log in), then
              join your family vault.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {family && (
              <>
                <div>
                  <Label>Invite code</Label>
                  <p className="mt-1 font-mono text-lg font-bold tracking-widest">
                    {family.inviteCode}
                  </p>
                </div>
                <div>
                  <Label>Invite link</Label>
                  <div className="mt-1 flex gap-2">
                    <Input readOnly value={inviteUrl} className="font-mono text-xs" />
                    <Button type="button" variant="outline" onClick={copyInvite}>
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {family?.role === "owner" && (
          <Card>
            <CardHeader>
              <CardTitle>Family name</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-3">
              <Input
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                placeholder="e.g. The Smith Family"
              />
              <Button onClick={saveFamilyName}>Save</Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Who has access ({family?.members.length ?? 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {family?.members.map((m) => (
                <li key={m.id} className="flex items-center justify-between py-3 first:pt-0">
                  <div>
                    <p className="font-medium">{m.displayName}</p>
                    <p className="text-sm text-muted-foreground">{m.email}</p>
                  </div>
                  <span className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium capitalize">
                    {m.role === "owner" && <Crown className="h-3 w-3 text-amber-600" />}
                    {m.role}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {!cloudMode && (
          <p className="text-sm text-muted-foreground">
            <a href="/login?force=1" className="text-primary underline">
              Log in
            </a>{" "}
            with your cloud account to manage family sharing.
          </p>
        )}
      </div>
    </PageTransition>
  );
}
