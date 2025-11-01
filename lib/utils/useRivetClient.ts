"use client";

import { createRivetKit } from "@rivetkit/next-js/client";
import type { registry } from "@/rivet/registry";

// The endpoint should point to your Next.js API route, not Rivet Cloud
export const { useActor } = createRivetKit<typeof registry>({
  endpoint: typeof window !== "undefined"
    ? `${window.location.origin}/api/rivet`
    : "/api/rivet",
});
