"use client";

import { useEffect, useRef } from "react";
import { recordLoginCheckIn } from "@/lib/actions/check-in";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { useUser } from "@/lib/auth/hooks";

/** Records a login check-in once per browser session. */
export function CheckInTracker() {
  const { user } = useUser();
  const recorded = useRef(false);

  useEffect(() => {
    if (!user || !isSupabaseConfigured() || recorded.current) return;
    recorded.current = true;
    recordLoginCheckIn().catch(() => {});
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
