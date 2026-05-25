import { Sidebar } from "@/components/dashboard/sidebar";
import { MobileTabBar } from "@/components/dashboard/mobile-tab-bar";
import { DashboardHeader } from "@/components/dashboard/header";
import { HelpButton } from "@/components/dashboard/help-button";
import { GentleGuide } from "@/components/dashboard/gentle-guide";
import { CloudBanner } from "@/components/dashboard/cloud-banner";
import { VaultProvider } from "@/lib/store";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <VaultProvider>
      <div className="flex h-screen flex-col lg:flex-row">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <DashboardHeader />
          <main id="main-content" className="flex-1 overflow-y-auto pb-20 lg:pb-0">
            <div className="mx-auto max-w-5xl px-5 py-6 lg:px-10 lg:py-8">
              <CloudBanner />
              <GentleGuide />
              {children}
            </div>
          </main>
        </div>
        <MobileTabBar />
        <HelpButton />
      </div>
    </VaultProvider>
  );
}
