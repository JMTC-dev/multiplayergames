import { toNextHandler } from "@rivetkit/next-js";
import { registry } from "@/rivet/registry";

// Required for Vercel deployments
export const maxDuration = 300;
export const dynamic = "force-dynamic";

export const { GET, POST, PUT, PATCH, HEAD, OPTIONS } = toNextHandler(registry);
