import { headers } from "next/headers";
import { connection } from "next/server";
import { type ReactNode, Suspense } from "react";
import { Brand } from "@/components/brand/brand";
import { parseServerEnv } from "@/lib/env";
import { dayPartAt } from "@/lib/greeting";
import { requestInstant } from "@/server/clock";
import { ProfileGreeting } from "./profile-greeting";

interface TopBarProps {
  today: string;
}

async function GreetingForThisVisit({ today }: TopBarProps): Promise<ReactNode> {
  await connection();
  const { MOCK_SCENARIOS } = parseServerEnv(process.env);
  const instant = requestInstant(await headers(), MOCK_SCENARIOS);
  return <ProfileGreeting dayPart={dayPartAt(instant)} today={today} />;
}

export function TopBar({ today }: TopBarProps): ReactNode {
  return (
    <div className="flex flex-col gap-4 md:gap-5">
      <Brand placement="top-bar" />
      <Suspense fallback={<p className="h-[1.2em] w-60 animate-pulse rounded-6 bg-skeleton text-greeting" />}>
        <GreetingForThisVisit today={today} />
      </Suspense>
    </div>
  );
}
