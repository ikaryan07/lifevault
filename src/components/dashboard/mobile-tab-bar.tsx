"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  KeyRound,
  FolderLock,
  ClipboardCheck,
  Menu,
  Users,
  BookUser,
  Monitor,
  Home,
  Heart,
  QrCode,
  Settings,
  Accessibility,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { signOutClient } from "@/lib/auth/sign-out";

const tabs = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/dashboard/family/passwords", label: "Passwords", icon: KeyRound },
  { href: "/dashboard/vault", label: "Documents", icon: FolderLock },
  { href: "/dashboard/checklist", label: "Checklist", icon: ClipboardCheck },
  { href: "/dashboard/more", label: "More", icon: Menu, isMore: true },
];

const moreItems = [
  { href: "/dashboard/family/household", label: "Household Info", icon: Home },
  { href: "/dashboard/contacts", label: "Trusted People", icon: Users },
  { href: "/dashboard/directory", label: "Key Contacts", icon: BookUser },
  { href: "/dashboard/digital", label: "Online Accounts", icon: Monitor },
  { href: "/dashboard/messages", label: "Messages", icon: Heart },
  { href: "/dashboard/emergency-card", label: "Emergency Card", icon: QrCode },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/settings/accessibility", label: "Accessibility", icon: Accessibility },
];

export function MobileTabBar() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  async function handleSignOut() {
    await signOutClient();
  }

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-lg lg:hidden">
        <div className="mx-auto flex h-16 max-w-md items-center justify-around px-2">
          {tabs.map((tab) => {
            if (tab.isMore) {
              const isMoreActive = moreItems.some((i) =>
                pathname.startsWith(i.href)
              );
              return (
                <button
                  key="more"
                  onClick={() => setMoreOpen(true)}
                  className={cn(
                    "flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors",
                    isMoreActive
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  <tab.icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            }

            const isActive =
              pathname === tab.href ||
              (tab.href !== "/dashboard" && pathname.startsWith(tab.href));

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                    isActive && "bg-primary/10"
                  )}
                >
                  <tab.icon className="h-5 w-5" />
                </div>
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl pb-8">
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-muted" />
          <nav className="space-y-1">
            {moreItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMoreOpen(false)}
                  className={cn(
                    "flex items-center gap-4 rounded-xl px-4 py-3.5 text-base font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-base font-medium text-muted-foreground hover:bg-muted"
            >
              <LogOut className="h-5 w-5" />
              Sign out
            </button>
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}
