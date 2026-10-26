// Runs the Next.js standalone server exactly as the Docker image does (ADR-006): copies public/ and
// .next/static into .next/standalone, then loads server.js in this same process. No child process, so the
// signal Playwright sends on teardown stops the server directly (a spawned child left CI hanging).
import { cpSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";

const standalone = resolve(".next/standalone");
if (!existsSync(`${standalone}/server.js`)) {
  console.error("Missing .next/standalone/server.js. Run `pnpm build` first.");
  process.exit(1);
}
if (existsSync("public")) cpSync("public", `${standalone}/public`, { recursive: true });
cpSync(".next/static", `${standalone}/.next/static`, { recursive: true });

for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => process.exit(0));

createRequire(import.meta.url)(`${standalone}/server.js`);
