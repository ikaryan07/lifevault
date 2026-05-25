"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
import { Sun, Moon, LogOut, Settings, Accessibility, MapPin } from "lucide-react";
import { signOutClient } from "@/lib/auth/sign-out";

const mobileTitles: Record<string, string> = {
  "/dashboard": "Home",
  "/dashboard/family/passwords": "Passwords",
  "/dashboard/family/household": "Household",
  "/dashboard/family/members": "Family",
  "/dashboard/vault": "Documents",
  "/dashboard/checklist": "Checklist",
  "/dashboard/settings": "Settings",
  "/dashboard/settings/plan": "Plan",
};

function mobileTitle(pathname: string): string {
  if (mobileTitles[pathname]) return mobileTitles[pathname];
  if (pathname.startsWith("/dashboard/settings")) return "Settings";
  if (pathname.startsWith("/dashboard/family")) return "Family Hub";
  return "HomePin";
}

export function DashboardHeader() {
  const { profile } = useVault();
  const { resolvedTheme, setTheme } = useTheme();
  const pathname = usePathname();

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

  const profileMenu = (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-full border bg-muted px-1 py-1 pr-2 transition-colors hover:bg-accent lg:pr-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground lg:h-8 lg:w-8">
          {initials}
        </div>
        <span className="hidden text-sm font-medium lg:inline">{displayName}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <p className="text-sm font-medium">{displayName}</p>
          <p className="text-xs text-muted-foreground">{profile?.email || "user@example.com"}</p>
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
  );

  return (
    <>
      <header className="flex h-14 shrink-0 items-center justify-between border-b bg-background px-4 lg:hidden">
        <Link href="/dashboard" className="flex min-w-0 items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
            <MapPin className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="truncate text-sm font-semibold text-foreground">
            {mobileTitle(pathname)}
          </span>
        </Link>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            title={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {resolvedTheme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
          {profileMenu}
        </div>
      </header>

      <header className="hidden h-14 shrink-0 items-center justify-end gap-2 border-b bg-background px-6 lg:flex">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          title={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {resolvedTheme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        {profileMenu}
      </header>
    </>
  );
}
