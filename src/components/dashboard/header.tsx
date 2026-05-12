"use client";

import { useVault } from "@/lib/store";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Sun, Moon, LogOut, Settings, Accessibility } from "lucide-react";
import Link from "next/link";
import { signOutClient } from "@/lib/auth/sign-out";

export function DashboardHeader() {
  const { profile } = useVault();
  const { resolvedTheme, setTheme } = useTheme();

  async function handleSignOut() {
    await signOutClient();
  }

  const initials = (() => {
    if (!profile) return "U";
    const first = profile.firstName?.trim()?.[0] || "";
    const last = profile.lastName?.trim()?.[0] || "";
    return (first + last).toUpperCase() || profile.email?.[0]?.toUpperCase() || "U";
  })();

  const displayName = (() => {
    if (!profile) return "User";
    const name = `${profile.firstName || ""} ${profile.lastName || ""}`.trim();
    return name || profile.email || "User";
  })();

  return (
    <>
      <header className="hidden h-14 shrink-0 items-center justify-end gap-2 border-b bg-background px-6 lg:flex">
        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          title={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {resolvedTheme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
          <span className="sr-only">
            {resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          </span>
        </Button>

        {/* Profile dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-full border bg-muted px-1 py-1 pr-3 transition-colors hover:bg-accent">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {initials}
            </div>
            <span className="text-sm font-medium">{displayName}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <p className="text-sm font-medium">{displayName}</p>
              <p className="text-xs text-muted-foreground">
                {profile?.email || "user@example.com"}
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href="/dashboard/settings" />}>
              <Settings className="h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href="/dashboard/settings/accessibility" />}>
              <Accessibility className="h-4 w-4" />
              Accessibility
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
    </>
  );
}
