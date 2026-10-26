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
