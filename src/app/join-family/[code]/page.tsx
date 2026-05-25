import { JoinFamilyForm } from "@/components/family/join-family-form";
import { normalizeInviteCode } from "@/lib/auth/site-url";
import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ code: string }>;
};

export default async function JoinFamilyWithCodePage({ params }: Props) {
  const { code } = await params;
  const normalized = normalizeInviteCode(code);

  if (!normalized) {
    redirect("/join-family");
  }

  return <JoinFamilyForm initialCode={normalized} autoJoin />;
}
