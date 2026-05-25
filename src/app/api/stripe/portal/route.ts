import { NextResponse } from "next/server";
import { createBillingPortalSession } from "@/lib/actions/subscription";

export async function POST() {
  try {
    const result = await createBillingPortalSession();
    if ("error" in result && result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ url: result.url });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Portal failed" },
      { status: 500 }
    );
  }
}
