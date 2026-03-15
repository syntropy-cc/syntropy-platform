/**
 * Export OpenAPI spec to docs/api/openapi.json (COMP-033.6).
 * Run after build: pnpm build && pnpm openapi:export
 */

import { createApp } from "../dist/server.js";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..", "..");
const outPath = join(repoRoot, "docs", "api", "openapi.json");

async function main() {
  const app = await createApp();
  await app.ready();
  const res = await app.inject({ method: "GET", url: "/api/v1/openapi.json" });
  await app.close();
  if (res.statusCode !== 200) {
    console.error("Failed to get OpenAPI spec:", res.statusCode, res.payload);
    process.exit(1);
  }
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, res.payload, "utf8");
  console.log("Wrote", outPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
