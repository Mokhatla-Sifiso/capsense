import { existsSync, readFileSync } from "node:fs";

const HOME_PAGE = ".next/server/app/index.html";

if (!existsSync(HOME_PAGE)) throw new Error(`${HOME_PAGE} is missing. Run pnpm build first.`);

const html = readFileSync(HOME_PAGE, "utf8");
const scripts = new Set([...html.matchAll(/\/_next\/(static\/[^"]+?\.js)/g)].map(([, file]) => `.next/${file}`));

const limits = [{ name: "Initial JavaScript on /", path: [...scripts], limit: "250 kB", gzip: true }];

export default limits;
