"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useVault } from "@/lib/store";
import { updateFamilyName } from "@/lib/actions/family-hub";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { PageTransition } from "@/components/motion/page-transition";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Copy, Check, Crown, Link2, Share2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { joinFamilyUrl } from "@/lib/auth/site-url";

function MembersSkeleton() {
  return (
    <div className="animate-pulse space-y-6" aria-hidden>
      <div className="space-y-2">
        <div className="h-8 w-48 rounded-lg bg-muted" />
        <div className="h-4 w-full max-w-lg rounded bg-muted" />
      </div>
      <div className="h-48 rounded-xl bg-muted" />
      <div className="h-40 rounded-xl bg-muted" />
    </div>
  );
}

export default function FamilyMembersPage() {
  const {
    cloudMode,
    family,
    refreshCloud,
    isHydrated,
    cloudLoading,
    plan,
    isOwner,
    subscriptionLoading,
    encryptionReady,
  } = useVault();
  const [familyName, setFamilyName] = useState("");
  const [copied, setCopied] = useState(false);
  const [savingName, setSavingName] = useState(false);

  useEffect(() => {
    if (family?.name) setFamilyName(family.name);
  }, [family?.name]);

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

  if (cloudMode && !isHydrated) {
    return (
      <PageTransition>
        <MembersSkeleton />
      </PageTransition>
    );
  }

  const inviteUrl = family ? joinFamilyUrl(family.inviteCode) : "";
  const needsUpgradeToInvite = isOwner && plan.id === "free" && !subscriptionLoading;

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

  async function shareInvite() {
    if (!inviteUrl || !family) return;
    const shareText = `Join our HomePin family vault. Code: ${family.inviteCode}\n${inviteUrl}`;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: "Join my HomePin family",
          text: shareText,
          url: inviteUrl,
        });
        return;
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
      }
    }
    await copyInvite();
  }

  async function saveFamilyName() {
    setSavingName(true);
    try {
      const result = await updateFamilyName(familyName);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Family name updated");
      await refreshCloud();
    } finally {
      setSavingName(false);
    }
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

        {!family && cloudLoading ? (
          <MembersSkeleton />
        ) : (
          <>
            {needsUpgradeToInvite && (
              <Card className="border-amber-500/40 bg-amber-500/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
                    <Sparkles className="h-5 w-5" />
                    Start a Family trial before inviting people
                  </CardTitle>
                  <CardDescription className="text-amber-900/80 dark:text-amber-100/80">
                    The Free plan is solo only. Your family won&apos;t be able to join until you
                    start a 14-day Family trial (no card required) or subscribe.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/dashboard/settings/plan" className={buttonVariants()}>
                    Start Family trial
                  </Link>
                </CardContent>
              </Card>
            )}

            {!encryptionReady && cloudMode && (
              <Card className="border-destructive/40 bg-destructive/5">
                <CardHeader>
                  <CardTitle className="text-destructive">Password encryption not configured</CardTitle>
                  <CardDescription>
                    Set <code className="text-xs">ENCRYPTION_SECRET</code> in Vercel — family
                    passwords cannot be saved until this is fixed.
                  </CardDescription>
                </CardHeader>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link2 className="h-5 w-5 text-primary" />
                  Invite your family
                </CardTitle>
                <CardDescription>
                  Send this link by text or WhatsApp. It looks like{" "}
                  <span className="font-mono text-foreground">homepin.vercel.app/join-family/abc12345</span>
                  {" "}so it won&apos;t get cut off like old links with question marks.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {family ? (
                  <>
                    <div>
                      <Label>Invite code</Label>
                      <p className="mt-1 font-mono text-lg font-bold tracking-widest">
                        {family.inviteCode}
                      </p>
                    </div>
                    <div>
                      <Label>Invite link</Label>
                      <div className="mt-1 flex flex-col gap-2 sm:flex-row">
                        <Input readOnly value={inviteUrl} className="font-mono text-xs" />
                        <Button
                          type="button"
                          variant="outline"
                          className="shrink-0 sm:min-w-24"
                          onClick={shareInvite}
                          disabled={needsUpgradeToInvite}
                        >
                          <Share2 className="mr-2 h-4 w-4" />
                          Share
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="shrink-0 sm:min-w-24"
                          onClick={copyInvite}
                          disabled={needsUpgradeToInvite}
                        >
                          {copied ? (
                            <>
                              <Check className="mr-2 h-4 w-4" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="mr-2 h-4 w-4" />
                              Copy link
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {cloudMode
                      ? "Could not load your family yet. Try refreshing the page."
                      : "Log in with your cloud account to invite family members."}
                  </p>
                )}
              </CardContent>
            </Card>

            {family?.role === "owner" && (
              <Card>
                <CardHeader>
                  <CardTitle>Family name</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 sm:flex-row">
                  <Input
                    value={familyName}
                    onChange={(e) => setFamilyName(e.target.value)}
                    placeholder="e.g. The Smith Family"
                  />
                  <Button
                    onClick={saveFamilyName}
                    disabled={savingName}
                    className="shrink-0 sm:min-w-24"
                  >
                    {savingName ? "Saving…" : "Save"}
                  </Button>
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
                {family?.members.length ? (
                  <ul className="divide-y">
                    {family.members.map((m) => (
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
                ) : (
                  <p className="text-sm text-muted-foreground">No members listed yet.</p>
                )}
              </CardContent>
            </Card>
          </>
        )}

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
