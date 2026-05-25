"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Users } from "lucide-react";
import { joinFamilyByInviteCode } from "@/lib/actions/family-hub";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";

function JoinFamilyContent() {
  const searchParams = useSearchParams();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fromUrl = searchParams.get("code");
    if (fromUrl) setCode(fromUrl);
  }, [searchParams]);

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) {
      setError("Enter your invite code");
      return;
    }

    setLoading(true);
    setError("");

    const result = await joinFamilyByInviteCode(code);
    if ("error" in result && result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    window.location.href = "/dashboard/family/members";
  }

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

  const loginHref = `/login?force=1&next=${encodeURIComponent(`/join-family?code=${code}`)}`;

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
        Enter the invite code from whoever set up your family vault. You&apos;ll see the same
        passwords and household info as everyone else.
      </p>

      <form onSubmit={handleJoin} className="mt-8 space-y-4">
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
        Wrong account?{" "}
        <Link href={loginHref} className="text-primary underline">
          Switch account
        </Link>
      </p>
    </div>
  );
}

export default function JoinFamilyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <JoinFamilyContent />
    </Suspense>
  );
}
