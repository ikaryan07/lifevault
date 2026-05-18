import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { SkipLink } from "@/components/accessibility/skip-link";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#0d9488",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://homepin.com.au"),
  title: "HomePin — Your Family's Passwords & Future, Secured",
  description:
    "One secure place for your family's shared passwords, household info, and important documents. Plus complete end-of-life planning. Australian-made.",
  keywords: [
    "family password sharing",
    "household passwords",
    "end of life planning",
    "estate planning",
    "document vault",
    "wills australia",
    "family documents",
    "shared logins",
  ],
  manifest: "/manifest.json",
  openGraph: {
    title: "HomePin — Your Family's Passwords & Future, Secured",
    description:
      "One secure place for your family's shared passwords, household info, and important documents. Plus complete end-of-life planning.",
    url: "https://homepin.com.au",
    siteName: "HomePin",
    locale: "en_AU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HomePin — Your Family's Passwords & Future, Secured",
    description:
      "One secure place for your family's shared passwords, household info, and important documents. Australian-made.",
  },
  alternates: {
    canonical: "https://homepin.com.au",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("homepin:theme");if(t==="dark"||(t==="system"||!t)&&matchMedia("(prefers-color-scheme:dark)").matches)document.documentElement.classList.add("dark")}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <SkipLink />
        <ThemeProvider>
          {children}
          <Toaster position="top-center" richColors closeButton />
          <PWAInstallPrompt />
        </ThemeProvider>
      </body>
    </html>
  );
}
