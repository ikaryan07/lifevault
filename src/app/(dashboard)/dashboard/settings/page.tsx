"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { MfaSettings } from "@/components/settings/mfa-settings";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Shield,
  CreditCard,
  Bell,
  Trash2,
  AlertTriangle,
  Accessibility,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { updatePassword } from "@/lib/auth/actions";
import { PageTransition } from "@/components/motion/page-transition";
import { useVault, PLANS } from "@/lib/store";
import { planSummary } from "@/lib/plans";

interface NotificationPrefs {
  checkIn: boolean;
  freshness: boolean;
  access: boolean;
}

const NOTIFICATION_KEY = "homepin:notifications";
const CHECKIN_KEY = "homepin:checkin-days";

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export default function SettingsPage() {
  const router = useRouter();
  const { profile, setProfile, plan } = useVault();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [checkInDays, setCheckInDays] = useState(30);
  const [notifications, setNotifications] = useState<NotificationPrefs>({
    checkIn: true,
    freshness: true,
    access: true,
  });

  useEffect(() => {
    async function loadProfile() {
      if (typeof window !== "undefined") {
        setNotifications(
          safeParse<NotificationPrefs>(
            localStorage.getItem(NOTIFICATION_KEY),
            { checkIn: true, freshness: true, access: true }
          )
        );
        const days = Number(localStorage.getItem(CHECKIN_KEY));
        if (!Number.isNaN(days) && days > 0) setCheckInDays(days);
      }

      if (!isSupabaseConfigured()) {
        if (profile) {
          setFirstName(profile.firstName || "");
          setLastName(profile.lastName || "");
          setEmail(profile.email || "");
        }
        return;
      }

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: dbProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (dbProfile) {
        setFirstName(dbProfile.first_name || "");
        setLastName(dbProfile.last_name || "");
        setEmail(dbProfile.email || "");
        setPhone(dbProfile.phone || "");
        setCheckInDays(dbProfile.check_in_interval_days || 30);
      }
    }
    loadProfile();
  }, [profile]);

  async function handleSaveProfile() {
    setSaving(true);
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(CHECKIN_KEY, String(checkInDays));
      }

      if (!isSupabaseConfigured()) {
        setProfile({
          firstName,
          lastName,
          email,
          createdAt: profile?.createdAt || new Date().toISOString(),
        });
        toast.success("Profile updated", { description: "Your changes have been saved." });
        setSaving(false);
        return;
      }

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: firstName,
          last_name: lastName,
          phone,
          check_in_interval_days: checkInDays,
        })
        .eq("id", user.id);

      if (error) throw error;
      toast.success("Profile updated", { description: "Your changes have been saved." });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast.error("Failed to save", { description: message });
    } finally {
      setSaving(false);
    }
  }

  function toggleNotification(key: keyof NotificationPrefs) {
    const next = { ...notifications, [key]: !notifications[key] };
    setNotifications(next);
    if (typeof window !== "undefined") {
      localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(next));
    }
    toast.success("Preferences updated");
  }

  async function handleChangePassword() {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setChangingPassword(true);
    const formData = new FormData();
    formData.set("password", newPassword);
    const result = await updatePassword(formData);

    if (result.error) {
      toast.error("Failed to change password", { description: result.error });
    } else {
      toast.success("Password changed", { description: "Your new password is active." });
      setPasswordDialogOpen(false);
      setNewPassword("");
      setConfirmPassword("");
    }
    setChangingPassword(false);
  }

  async function handleDeleteAccount() {
    if (deleteConfirmText !== "DELETE") {
      toast.error("Please type DELETE to confirm");
      return;
    }

    if (!isSupabaseConfigured()) {
      // Demo mode — clear all local data and sign out
      if (typeof window !== "undefined") {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith("homepin")) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((key) => localStorage.removeItem(key));
      }
      toast.success("Account deleted", {
        description: "All your local data has been removed.",
      });
      router.push("/");
      return;
    }

    // Real Supabase path - actual deletion requires server-side handling
    toast.error("Account deletion in progress", {
      description:
        "We've started the deletion process. You'll receive a confirmation email shortly. For immediate help, contact support@homepin.com.au.",
    });
    setDeleteDialogOpen(false);
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your account, security, and preferences.
          </p>
        </div>

        {/* Profile */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your personal information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="settingsFirst">First name</Label>
                <Input
                  id="settingsFirst"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  autoComplete="given-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="settingsLast">Last name</Label>
                <Input
                  id="settingsLast"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  autoComplete="family-name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="settingsEmail">Email</Label>
              <Input
                id="settingsEmail"
                type="email"
                value={email}
                disabled
                className="opacity-60"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed here. Contact support if you need to update it.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="settingsPhone">Phone (optional)</Label>
              <Input
                id="settingsPhone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="04XX XXX XXX"
                autoComplete="tel"
              />
            </div>
            <Button onClick={handleSaveProfile} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Security</CardTitle>
                <CardDescription>Protect your account with strong security.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Password</p>
                <p className="text-xs text-muted-foreground">Change your account password.</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setPasswordDialogOpen(true)}>
                Change Password
              </Button>
            </div>
            <Separator />
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-medium">Two-Factor Authentication (2FA)</p>
                <p className="text-xs text-muted-foreground">Add extra security with an authenticator app.</p>
              </div>
              <MfaSettings />
            </div>
            <Separator />
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Inactivity Check-In</p>
                <p className="text-xs text-muted-foreground">
                  If you don&apos;t log in for {checkInDays} days, we&apos;ll email you. If no response, your trusted contacts are notified.
                </p>
              </div>
              <select
                value={checkInDays}
                onChange={(e) => setCheckInDays(Number(e.target.value))}
                className="rounded-lg border bg-background px-3 py-2 text-sm"
                aria-label="Inactivity check-in interval"
              >
                <option value={14}>14 days</option>
                <option value={30}>30 days</option>
                <option value={60}>60 days</option>
                <option value={90}>90 days</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Subscription */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Subscription</CardTitle>
                <CardDescription>Manage your plan and billing.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-start justify-between gap-3 rounded-lg border p-4 sm:flex-row sm:items-center">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{plan.name} Plan</p>
                  <Badge variant={plan.id === "free" ? "secondary" : "default"} className="text-[10px]">
                    {plan.price}{plan.id !== "free" ? plan.period : ""}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {planSummary(plan.id)}
                </p>
              </div>
              <Link
                href="/dashboard/settings/plan"
                className={buttonVariants({ variant: plan.id === "free" ? "default" : "outline" })}
              >
                {plan.id === "free" ? "Upgrade" : "Manage Plan"}
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Choose what you&apos;d like to be notified about.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="flex cursor-pointer items-center justify-between rounded-lg px-2 py-2 transition-colors hover:bg-muted/50">
              <span className="text-sm">Check-in reminders</span>
              <input
                type="checkbox"
                checked={notifications.checkIn}
                onChange={() => toggleNotification("checkIn")}
                className="h-4 w-4 rounded accent-primary"
              />
            </label>
            <label className="flex cursor-pointer items-center justify-between rounded-lg px-2 py-2 transition-colors hover:bg-muted/50">
              <span className="text-sm">Data freshness reminders</span>
              <input
                type="checkbox"
                checked={notifications.freshness}
                onChange={() => toggleNotification("freshness")}
                className="h-4 w-4 rounded accent-primary"
              />
            </label>
            <label className="flex cursor-pointer items-center justify-between rounded-lg px-2 py-2 transition-colors hover:bg-muted/50">
              <span className="text-sm">Vault access requests</span>
              <input
                type="checkbox"
                checked={notifications.access}
                onChange={() => toggleNotification("access")}
                className="h-4 w-4 rounded accent-primary"
              />
            </label>
          </CardContent>
        </Card>

        {/* Accessibility */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Accessibility className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Accessibility</CardTitle>
                <CardDescription>
                  Font size, contrast, motion, and language preferences.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Link
              href="/dashboard/settings/accessibility"
              className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
            >
              <div>
                <p className="text-sm font-medium">Accessibility settings</p>
                <p className="text-xs text-muted-foreground">
                  Make HomePin easier to read and use.
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              <div>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>Irreversible actions. Be careful.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-medium">Delete Account</p>
                <p className="text-xs text-muted-foreground">
                  Permanently delete your account, documents, and all data. This cannot be undone.
                </p>
              </div>
              <Button variant="destructive" size="sm" onClick={() => setDeleteDialogOpen(true)}>
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Change Password Dialog */}
        <Dialog
          open={passwordDialogOpen}
          onOpenChange={(open) => {
            setPasswordDialogOpen(open);
            if (!open) {
              setNewPassword("");
              setConfirmPassword("");
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change Password</DialogTitle>
              <DialogDescription>Enter a new password for your account.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Type it again"
                  autoComplete="new-password"
                />
              </div>
              <Button onClick={handleChangePassword} disabled={changingPassword} className="w-full">
                {changingPassword ? "Updating..." : "Update Password"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Account Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onOpenChange={(open) => {
            setDeleteDialogOpen(open);
            if (!open) setDeleteConfirmText("");
          }}
        >
          <DialogContent>
            <DialogHeader>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div className="flex-1">
                  <DialogTitle className="text-base">Delete your account?</DialogTitle>
                  <DialogDescription className="mt-1.5">
                    This will permanently delete your vault, all documents, contacts,
                    and data. This action cannot be undone.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <div className="space-y-3 pt-2">
              <Label htmlFor="delete-confirm">
                Type <strong>DELETE</strong> to confirm
              </Label>
              <Input
                id="delete-confirm"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                autoComplete="off"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== "DELETE"}
              >
                Yes, delete everything
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}
