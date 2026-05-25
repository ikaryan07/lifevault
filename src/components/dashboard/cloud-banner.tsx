"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useVault } from "@/lib/store";
import { useUser } from "@/lib/auth/hooks";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { Cloud, CloudOff, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";

const bannerShell =
  "mb-4 flex flex-col gap-2 rounded-xl px-4 py-3 sm:mb-6 sm:flex-row sm:items-center sm:gap-3";
const DISMISS_KEY = "homepin:cloud-banner-dismissed";

export function CloudBanner() {
  const { cloudMode, family } = useVault();
  const { user, loading: authLoading } = useUser();
  const [mounted, setMounted] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDismissed(localStorage.getItem(DISMISS_KEY) === "1");
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  }

  if (!mounted) {
    return (
      <div
        className={cn(bannerShell, "border border-primary/30 bg-primary/5 text-sm text-foreground")}
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
        className={cn(
          bannerShell,
          "border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-100"
        )}
      >
        <CloudOff className="h-4 w-4 shrink-0" />
        <p className="text-sm">
          <strong>Demo mode</strong> — data stays on this device only. Connect Supabase to sync
          with your family.
        </p>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className={cn(bannerShell, "border border-primary/30 bg-primary/5 text-sm text-foreground")}>
        <Cloud className="h-4 w-4 shrink-0 animate-pulse text-primary" />
        <span>Connecting to cloud...</span>
      </div>
    );
  }

  if (!user || !cloudMode) {
    return (
      <div className={cn(bannerShell, "border border-primary/30 bg-primary/5")}>
        <Cloud className="h-4 w-4 shrink-0 text-primary" />
        <p className="flex-1 text-sm text-foreground">
          <strong>Cloud connected</strong> — log in to sync passwords and invite your family.
        </p>
        <a
          href="/login?force=1"
          className="inline-flex min-h-11 shrink-0 items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          <Users className="h-3.5 w-3.5" />
          Log in
        </a>
      </div>
    );
  }

  if (dismissed) return null;

  return (
    <div className={cn(bannerShell, "relative border border-primary/30 bg-primary/5 pr-10")}>
      <Cloud className="h-4 w-4 shrink-0 text-primary" />
      <p className="flex-1 text-sm text-foreground">
        <strong>Family cloud sync on</strong>
        {family
          ? ` — ${family.name}: ${family.members.length} member${family.members.length === 1 ? "" : "s"}.`
          : " — loading family..."}
      </p>
      <Link
        href="/dashboard/family/members"
        className="inline-flex min-h-11 shrink-0 items-center gap-1 text-xs font-semibold text-primary hover:underline"
      >
        <Users className="h-3.5 w-3.5" />
        Invite family
      </Link>
      <button
        type="button"
        onClick={dismiss}
        className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
        aria-label="Dismiss cloud status"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
