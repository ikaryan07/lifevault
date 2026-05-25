"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MapPin,
  LayoutDashboard,
  FolderLock,
  Users,
  ClipboardCheck,
  BookUser,
  Monitor,
  Heart,
  QrCode,
  Settings,
  LogOut,
  KeyRound,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOutClient } from "@/lib/auth/sign-out";

const familyHubItems = [
  { href: "/dashboard/family/passwords", label: "Passwords & Logins", icon: KeyRound },
  { href: "/dashboard/family/household", label: "Household Info", icon: Home },
  { href: "/dashboard/family/members", label: "Family Members", icon: Users },
];

const legacyVaultItems = [
  { href: "/dashboard/vault", label: "My Documents", icon: FolderLock },
  { href: "/dashboard/contacts", label: "Trusted People", icon: Users },
  { href: "/dashboard/checklist", label: "Checklists", icon: ClipboardCheck },
  { href: "/dashboard/directory", label: "Key Contacts", icon: BookUser },
  { href: "/dashboard/digital", label: "Online Accounts", icon: Monitor },
  { href: "/dashboard/messages", label: "Messages", icon: Heart },
  { href: "/dashboard/forms", label: "Forms & Resources", icon: BookUser },
  { href: "/dashboard/emergency-card", label: "Emergency Card", icon: QrCode },
];

function NavLink({
  href,
  label,
  icon: Icon,
  isActive,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
}) {
  return (
    <li>
      <Link
        href={href}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
          isActive
            ? "bg-sidebar-accent text-sidebar-primary"
            : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {label}
      </Link>
    </li>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <li className="px-3 pb-1 pt-4 first:pt-0">
      <span className="text-[10px] font-bold uppercase tracking-widest text-sidebar-foreground/40">
        {children}
      </span>
    </li>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === href;
    return pathname === href || pathname.startsWith(href);
  }

  async function handleSignOut() {
    await signOutClient();
  }

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-sidebar lg:flex lg:flex-col">
      <div className="flex h-16 items-center gap-2.5 border-b px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <MapPin className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="text-lg font-bold text-sidebar-foreground">
          HomePin
        </span>
      </div>

      <nav className="flex flex-1 flex-col justify-between overflow-y-auto p-3">
        <ul className="space-y-0.5">
          <NavLink
            href="/dashboard"
            label="Home"
            icon={LayoutDashboard}
            isActive={isActive("/dashboard") && pathname === "/dashboard"}
          />

          <SectionLabel>Family Hub</SectionLabel>
          {familyHubItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              isActive={isActive(item.href)}
            />
          ))}

          <SectionLabel>Legacy Vault</SectionLabel>
          {legacyVaultItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              isActive={isActive(item.href)}
            />
          ))}
        </ul>

        <ul className="space-y-0.5 border-t pt-3">
          <NavLink
            href="/dashboard/settings"
            label="Settings"
            icon={Settings}
            isActive={isActive("/dashboard/settings")}
          />
          <li>
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              Sign out
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
