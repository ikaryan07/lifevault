import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LifeVault — Secure End-of-Life Document Planning",
  description:
    "Securely store your important documents, guide your family through end-of-life planning, and ensure they have everything they need when it matters most. Australian-made.",
  keywords: [
    "end of life planning",
    "estate planning",
    "document vault",
    "wills",
    "australia",
    "death planning",
    "family documents",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
