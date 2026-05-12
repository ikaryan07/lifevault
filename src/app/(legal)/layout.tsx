import { LandingHeader } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <LandingHeader />
      <main id="main-content" className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
          <article className="prose prose-slate max-w-none dark:prose-invert">
            {children}
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
