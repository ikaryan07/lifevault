"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Users } from "lucide-react";
import { joinFamilyByInviteCode } from "@/lib/actions/family-hub";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { joinFamilyPath, normalizeInviteCode } from "@/lib/auth/site-url";
import { clearPendingJoin } from "@/lib/auth/pending-join";

type JoinFamilyFormProps = {
  initialCode?: string;
  autoJoin?: boolean;
};

export function JoinFamilyForm({ initialCode = "", autoJoin = false }: JoinFamilyFormProps) {
  const [code, setCode] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const autoJoinStarted = useRef(false);

  useEffect(() => {
    if (initialCode) setCode(initialCode);
  }, [initialCode]);

  async function handleJoin(submittedCode?: string) {
    const value = (submittedCode ?? code).trim();
    if (!value) {
      setError("Enter your invite code");
      return;
    }

    setLoading(true);
    setError("");

    const result = await joinFamilyByInviteCode(value);
    if ("error" in result && result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    clearPendingJoin();
    window.location.href = "/dashboard/family/members";
  }

  useEffect(() => {
    if (!autoJoin || !initialCode || autoJoinStarted.current) return;
    autoJoinStarted.current = true;

    void (async () => {
      setLoading(true);
      setError("");
      const result = await joinFamilyByInviteCode(initialCode);
      if ("error" in result && result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }
      clearPendingJoin();
      window.location.href = "/dashboard/family/members";
    })();
  }, [autoJoin, initialCode]);

  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto max-w-md px-6 py-16 text-center">
        <h1 className="text-xl font-bold">Cloud not configured</h1>
        <p className="mt-2 text-muted-foreground">
          Family sharing needs Supabase. See SETUP.md in the project.
        </p>
        <Link href="/" className="mt-6 inline-block text-primary underline">
          Back home
        </Link>
      </div>
    );
  }

  const normalized = normalizeInviteCode(code);
  const joinPath = normalized ? joinFamilyPath(normalized) : "/join-family";
  const loginHref = `/login?force=1&next=${encodeURIComponent(joinPath)}`;
  const signupHref = normalized ? `/signup?join=${encodeURIComponent(normalized)}` : "/signup";

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <div className="flex items-center gap-2.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
          <MapPin className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-xl font-bold">HomePin</span>
      </div>

      <div className="mt-8 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        <Users className="h-6 w-6 text-primary" />
      </div>

      <h1 className="mt-4 text-2xl font-bold">Join your family</h1>
      <p className="mt-2 text-muted-foreground">
        Tap the invite link again or enter the code below. You&apos;ll see the same passwords and
        household info as everyone else.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void handleJoin();
        }}
        className="mt-8 space-y-4"
      >
        <div>
          <Label htmlFor="code">Invite code</Label>
          <Input
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. a1b2c3d4"
            className="mt-1 font-mono"
            required
          />
        </div>

        {error && (
          <p
            className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
            role="alert"
          >
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Joining..." : "Join family"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Need an account?{" "}
        <Link href={signupHref} className="text-primary underline">
          Sign up
        </Link>
        {" · "}
        <Link href={loginHref} className="text-primary underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
