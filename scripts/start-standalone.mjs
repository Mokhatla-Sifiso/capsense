// Runs the Next.js standalone server exactly as the Docker image does (ADR-006): copies public/ and
// .next/static into .next/standalone, then starts server.js. Used by Playwright (ADR-005).
import { cpSync, existsSync } from "node:fs";
import { spawn } from "node:child_process";

const standalone = ".next/standalone";
if (!existsSync(`${standalone}/server.js`)) {
  console.error("Missing .next/standalone/server.js. Run `pnpm build` first.");
  process.exit(1);
}
if (existsSync("public")) cpSync("public", `${standalone}/public`, { recursive: true });
cpSync(".next/static", `${standalone}/.next/static`, { recursive: true });

const server = spawn(process.execPath, [`${standalone}/server.js`], { stdio: "inherit", env: process.env });
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => server.kill(signal));
server.on("exit", (code) => process.exit(code ?? 0));
