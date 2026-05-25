import Link from "next/link";
import { Shield, Lock, Server, Eye } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link href="/" className="font-bold text-primary">
            HomePin
          </Link>
          <Link href="/signup" className={cn(buttonVariants({ size: "sm" }))}>
            Get started
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-12 space-y-10">
        <div>
          <h1 className="text-3xl font-bold">Security & privacy</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            How HomePin protects your family&apos;s passwords, documents, and legacy planning data.
          </p>
        </div>

        <section className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border p-6">
            <Lock className="h-8 w-8 text-primary" />
            <h2 className="mt-3 font-semibold">Encryption</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Family passwords and household info are encrypted at rest on our servers. Documents
              are encrypted on your device before upload — we store ciphertext, not readable files.
            </p>
          </div>
          <div className="rounded-2xl border p-6">
            <Server className="h-8 w-8 text-primary" />
            <h2 className="mt-3 font-semibold">Australian hosting</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Data is hosted on Supabase and Vercel infrastructure with Australian-friendly
              privacy practices. We never sell your information.
            </p>
          </div>
          <div className="rounded-2xl border p-6">
            <Eye className="h-8 w-8 text-primary" />
            <h2 className="mt-3 font-semibold">Who can see what</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Family Hub data is shared with your family members. Legacy vault data is private to
              you until you grant access to trusted contacts — and only under conditions you set.
            </p>
          </div>
          <div className="rounded-2xl border p-6">
            <Shield className="h-8 w-8 text-primary" />
            <h2 className="mt-3 font-semibold">Two-factor authentication</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Enable TOTP 2FA in Settings → Security for an extra layer on your account. We
              recommend it for anyone storing documents or legacy planning info.
            </p>
          </div>
        </section>

        <section className="rounded-2xl border bg-muted/30 p-6">
          <h2 className="font-semibold">What we don&apos;t do</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>We don&apos;t read your encrypted documents</li>
            <li>We don&apos;t share data with advertisers</li>
            <li>We don&apos;t grant vault access without your trusted-contact process</li>
            <li>We don&apos;t provide legal advice — consult a professional for wills and estates</li>
          </ul>
        </section>

        <p className="text-sm text-muted-foreground">
          Questions?{" "}
          <a href="mailto:support@homepin.com.au" className="text-primary hover:underline">
            support@homepin.com.au
          </a>
          {" · "}
          <Link href="/how-access" className="text-primary hover:underline">
            How vault access works
          </Link>
        </p>
      </main>
    </div>
  );
}
