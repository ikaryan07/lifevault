"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  KeyRound,
  Home,
  Users,
  Menu,
  FolderLock,
  ClipboardCheck,
  BookUser,
  Monitor,
  Heart,
  QrCode,
  FileText,
  Settings,
  Accessibility,
  LogOut,
  HelpCircle,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { signOutClient } from "@/lib/auth/sign-out";
import { HelpButtonDialog } from "@/components/dashboard/help-button";

const tabs = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/family/passwords", label: "Passwords", icon: KeyRound },
  { href: "/dashboard/family/household", label: "Household", icon: Home },
  { href: "/dashboard/family/members", label: "Family", icon: Users },
  { href: "/dashboard/more", label: "More", icon: Menu, isMore: true },
];

const moreItems = [
  { href: "/dashboard/vault", label: "Documents", icon: FolderLock },
  { href: "/dashboard/checklist", label: "Checklist", icon: ClipboardCheck },
  { href: "/dashboard/contacts", label: "Trusted People", icon: Users },
  { href: "/dashboard/directory", label: "Key Contacts", icon: BookUser },
  { href: "/dashboard/digital", label: "Online Accounts", icon: Monitor },
  { href: "/dashboard/messages", label: "Messages", icon: Heart },
  { href: "/dashboard/forms", label: "Forms & Resources", icon: FileText },
  { href: "/dashboard/emergency-card", label: "Emergency Card", icon: QrCode },
  { href: "/dashboard/vault-access", label: "Vault Access", icon: Shield },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/settings/accessibility", label: "Accessibility", icon: Accessibility },
];

function isTabActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function isMoreItemActive(pathname: string, href: string) {
  if (href === "/dashboard/settings/accessibility") {
    return pathname === href;
  }
  if (href === "/dashboard/settings") {
    return (
      pathname === href ||
      (pathname.startsWith("/dashboard/settings/") &&
        pathname !== "/dashboard/settings/accessibility")
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileTabBar() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  async function handleSignOut() {
    await signOutClient();
  }

  const isMoreActive = moreItems.some((i) => isMoreItemActive(pathname, i.href));

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-lg safe-bottom lg:hidden"
        aria-label="Main navigation"
      >
        <div className="mx-auto flex max-w-md items-stretch justify-around px-1 pt-1">
          {tabs.map((tab) => {
            if (tab.isMore) {
              return (
                <button
                  key="more"
                  type="button"
                  onClick={() => setMoreOpen(true)}
                  aria-current={isMoreActive ? "page" : undefined}
                  className={cn(
                    "flex min-h-14 min-w-[4.5rem] flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-1 text-[11px] font-medium transition-colors",
                    isMoreActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
                      isMoreActive && "bg-primary/10"
                    )}
                  >
                    <tab.icon className="h-5 w-5" />
                  </div>
                  <span>{tab.label}</span>
                </button>
              );
            }

            const isActive = isTabActive(pathname, tab.href, tab.exact);

            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex min-h-14 min-w-[4.5rem] flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-1 text-[11px] font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
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
        <SheetContent side="bottom" className="rounded-t-2xl pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
          <SheetHeader className="pb-2">
            <SheetTitle>More</SheetTitle>
          </SheetHeader>
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-muted" />
          <nav className="max-h-[60vh] space-y-1 overflow-y-auto">
            {moreItems.map((item) => {
              const isActive = isMoreItemActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMoreOpen(false)}
                  className={cn(
                    "flex min-h-12 items-center gap-4 rounded-xl px-4 py-3 text-base font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
            <button
              type="button"
              onClick={() => {
                setMoreOpen(false);
                setHelpOpen(true);
              }}
              className="flex min-h-12 w-full items-center gap-4 rounded-xl px-4 py-3 text-base font-medium text-foreground hover:bg-muted"
            >
              <HelpCircle className="h-5 w-5 shrink-0" />
              Help & FAQ
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="flex min-h-12 w-full items-center gap-4 rounded-xl px-4 py-3 text-base font-medium text-muted-foreground hover:bg-muted"
            >
              <LogOut className="h-5 w-5 shrink-0" />
              Sign out
            </button>
          </nav>
        </SheetContent>
      </Sheet>

      <HelpButtonDialog open={helpOpen} onOpenChange={setHelpOpen} />
    </>
  );
}
