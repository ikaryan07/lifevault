import { Suspense } from "react";
import { JoinFamilyForm } from "@/components/family/join-family-form";

export default function JoinFamilyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <JoinFamilyForm />
    </Suspense>
  );
}
