import Link from "next/link";
import { Shield } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 bg-primary lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-primary-foreground">
            LifeVault
          </span>
        </Link>

        <div>
          <blockquote className="text-lg leading-relaxed text-primary-foreground/90">
            &ldquo;After Mum passed, we were overwhelmed trying to find
            everything. LifeVault would have saved us weeks of stress during the
            hardest time of our lives.&rdquo;
          </blockquote>
          <p className="mt-4 text-sm font-medium text-primary-foreground/70">
            — Sarah M., Melbourne
          </p>
        </div>

        <p className="text-xs text-primary-foreground/50">
          &copy; {new Date().getFullYear()} LifeVault. All rights reserved.
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
