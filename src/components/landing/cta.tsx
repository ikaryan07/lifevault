import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ArrowRight, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

export function CTA() {
  return (
    <section className="border-t bg-gradient-to-b from-primary/5 via-primary/10 to-primary/5 py-24">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <Shield className="h-7 w-7 text-primary" />
        </div>

        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Your family will thank you
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
          It takes two minutes to save your first password. It takes ten to upload
          your most important document. Start small — the rest will follow.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/signup"
            className={cn(
              buttonVariants({ size: "lg" }),
              "gap-2 text-base px-8"
            )}
          >
            Create your free vault
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          Free forever plan. No credit card. Cancel anytime.
        </p>
      </div>
    </section>
  );
}
