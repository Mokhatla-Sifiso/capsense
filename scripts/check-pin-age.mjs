import { readFileSync } from "node:fs";

const MIN_AGE_DAYS = 14;
const DAY_MS = 86_400_000;
const EXACT_VERSION = /^\d+\.\d+\.\d+$/;

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const exceptions = JSON.parse(readFileSync("pin-age-exceptions.json", "utf8"));
const pins = Object.entries({ ...pkg.dependencies, ...pkg.devDependencies });

async function publishedAt(name, version) {
  const response = await fetch(`https://registry.npmjs.org/${name.replace("/", "%2F")}`);
  if (!response.ok) throw new Error(`${name}: the npm registry answered ${response.status}`);
  const { time } = await response.json();
  if (!time?.[version]) throw new Error(`${name}@${version} is not on the npm registry`);
  return new Date(time[version]);
}

async function check([name, version]) {
  if (!EXACT_VERSION.test(version)) return { problem: `${name}: "${version}" is not an exact version` };
  const ageDays = Math.floor((Date.now() - (await publishedAt(name, version))) / DAY_MS);
  const exception = exceptions[name]?.version === version ? exceptions[name] : undefined;
  if (ageDays >= MIN_AGE_DAYS) {
    return exception ? { note: `${name}@${version} is ${ageDays} days old; its exception can be removed` } : {};
  }
  if (exception) return { note: `${name}@${version} is ${ageDays} days old, allowed: ${exception.reason}` };
  return { problem: `${name}@${version} is only ${ageDays} days old (minimum ${MIN_AGE_DAYS})` };
}

const results = await Promise.all(pins.map(check));
const notes = results.flatMap((result) => result.note ?? []);
const problems = results.flatMap((result) => result.problem ?? []);

notes.forEach((note) => console.warn(`note: ${note}`));
problems.forEach((problem) => console.error(`error: ${problem}`));
if (problems.length > 0) process.exit(1);
console.warn(`All ${pins.length} pinned versions pass the ${MIN_AGE_DAYS}-day rule.`);
