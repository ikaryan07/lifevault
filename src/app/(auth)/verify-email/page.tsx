import Link from "next/link";
import { Mail, ArrowRight, Shield } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function VerifyEmailPage() {
  return (
    <div className="text-center">
      <Link href="/" className="mb-8 flex items-center justify-center gap-2.5 lg:hidden">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <Shield className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-xl font-bold text-foreground">HomePin</span>
      </Link>

      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <Mail className="h-8 w-8 text-primary" />
      </div>
      <h1 className="text-2xl font-bold text-foreground">
        Check your email
      </h1>
      <p className="mx-auto mt-3 max-w-sm text-base text-muted-foreground">
        We&apos;ve sent a verification link to your email address. Click the link
        to activate your vault.
      </p>
      <p className="mt-4 text-sm text-muted-foreground">
        It may take a minute to arrive. Check your spam folder if you don&apos;t see it.
      </p>
      <div className="mt-8">
        <Link href="/login" className={cn(buttonVariants({ variant: "outline" }), "gap-2")}>
          Continue to sign in
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
