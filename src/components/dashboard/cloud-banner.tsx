"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useVault } from "@/lib/store";
import { useUser } from "@/lib/auth/hooks";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { Cloud, CloudOff, Users } from "lucide-react";

const bannerShell =
  "mb-6 flex flex-col gap-2 rounded-xl px-4 py-3 sm:flex-row sm:items-center sm:gap-3";

export function CloudBanner() {
  const { cloudMode, family } = useVault();
  const { user, loading: authLoading } = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Same markup on server + first client paint — avoids hydration mismatch
  if (!mounted) {
    return (
      <div
        className={`${bannerShell} border border-primary/30 bg-primary/5 text-sm text-foreground`}
        aria-hidden
      >
        <Cloud className="h-4 w-4 shrink-0 animate-pulse text-primary" />
        <span>Connecting to cloud...</span>
      </div>
    );
  }

  if (!isSupabaseConfigured()) {
    return (
      <div
        className={`${bannerShell} border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-100`}
      >
        <CloudOff className="h-4 w-4 shrink-0" />
        <p className="text-sm">
          <strong>Demo mode</strong> — data stays on this device only. Connect Supabase
          (see SETUP.md in the project) to save securely in the cloud for your whole family.
        </p>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div
        className={`${bannerShell} border border-primary/30 bg-primary/5 text-sm text-foreground`}
      >
        <Cloud className="h-4 w-4 shrink-0 animate-pulse text-primary" />
        <span>Connecting to cloud...</span>
      </div>
    );
  }

  if (!user || !cloudMode) {
    return (
      <div className={`${bannerShell} border border-primary/30 bg-primary/5`}>
        <Cloud className="h-4 w-4 shrink-0 text-primary" />
        <p className="flex-1 text-sm text-foreground">
          <strong>Cloud connected</strong> — log in with your account to sync passwords and
          invite your family.
        </p>
        <a
          href="/login?force=1"
          className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          <Users className="h-3.5 w-3.5" />
          Log in
        </a>
      </div>
    );
  }

  return (
    <div className={`${bannerShell} border border-primary/30 bg-primary/5`}>
      <Cloud className="h-4 w-4 shrink-0 text-primary" />
      <p className="flex-1 text-sm text-foreground">
        <strong>Family cloud sync on</strong>
        {family
          ? ` — ${family.name}: ${family.members.length} member${family.members.length === 1 ? "" : "s"}. Everyone sees the same passwords & household info.`
          : " — loading family..."}
      </p>
      <Link
        href="/dashboard/family/members"
        className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary hover:underline"
      >
        <Users className="h-3.5 w-3.5" />
        Invite family
      </Link>
    </div>
  );
}
