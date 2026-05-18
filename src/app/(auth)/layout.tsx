import Link from "next/link";
import { MapPin, Wifi, FolderLock, Heart } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 bg-gradient-to-br from-primary via-primary to-primary/80 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20">
            <MapPin className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-primary-foreground">
            HomePin
          </span>
        </Link>

        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-primary-foreground">
              Everything your family needs, in one secure place.
            </h2>
            <p className="mt-3 text-base leading-relaxed text-primary-foreground/80">
              From WiFi passwords to wills — HomePin keeps your household
              running smoothly today, and protects the people you love for the future.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { icon: Wifi, text: "Shared passwords your family can always find" },
              { icon: FolderLock, text: "Important documents encrypted and safe" },
              { icon: Heart, text: "Legacy planning at your own pace" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15">
                  <item.icon className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-sm text-primary-foreground/90">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-primary-foreground/50">
          &copy; {new Date().getFullYear()} HomePin. All rights reserved. Made in Australia.
        </p>
      </div>

      <main id="main-content" className="flex flex-1 items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
