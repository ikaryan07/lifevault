import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Shield, Heart, Clock, Users } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function VaultAccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-2xl">LifeVault Access Request</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-muted-foreground">
            If someone you love has passed away or become incapacitated, you can request
            access to their LifeVault. This process is designed to be secure while still
            being accessible when it matters most.
          </p>

          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-lg border p-3">
              <Users className="h-5 w-5 shrink-0 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium">You must be a trusted contact</p>
                <p className="text-xs text-muted-foreground">Only people who were invited and accepted can request access.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border p-3">
              <Clock className="h-5 w-5 shrink-0 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium">Multi-person confirmation required</p>
                <p className="text-xs text-muted-foreground">At least 2 other trusted contacts must confirm your request.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border p-3">
              <Heart className="h-5 w-5 shrink-0 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium">7-day waiting period</p>
                <p className="text-xs text-muted-foreground">Access is granted after confirmations are received, up to 7 days.</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Link href="/login" className={cn(buttonVariants({ size: "lg" }), "w-full")}>
              Sign in to request access
            </Link>
            <Link href="/signup" className={cn(buttonVariants({ variant: "outline" }), "w-full")}>
              Create an account first
            </Link>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Need help?{" "}
            <a
              href="mailto:support@lifevault.com.au"
              className="text-primary underline-offset-2 hover:underline"
            >
              support@lifevault.com.au
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
