import { connection } from "next/server";
import { parseServerEnv } from "@/lib/env";

export async function demoToday(): Promise<string> {
  await connection();
  return parseServerEnv(process.env).MOCK_TODAY;
}
