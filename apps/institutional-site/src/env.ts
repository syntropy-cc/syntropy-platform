/**
 * Environment validation — runs when this module is loaded.
 * Import from app entry (e.g. root layout or instrumentation) to fail fast if env is missing.
 * COMP-037.6
 */

import { validateEnv } from "@syntropy/platform-core";

const REQUIRED_ENV_KEYS = ["NODE_ENV"] as const;

validateEnv([...REQUIRED_ENV_KEYS], { prefix: "institutional-site" });
