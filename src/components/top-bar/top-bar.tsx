import { headers } from "next/headers";
import { type ReactNode, Suspense } from "react";
import { AboutDialog } from "@/components/about/about-dialog";
import { Brand } from "@/components/brand/brand";
import { ThemeControl } from "@/components/theme/theme-control";
import { parseServerEnv } from "@/lib/env";
import { dayPartAt } from "@/lib/greeting";
import { requestInstant } from "@/server/clock";
import { demoToday } from "@/server/demo-today";
import { DataFreshness } from "./data-freshness";
import { ProfileGreeting } from "./profile-greeting";
import { RefreshButton } from "./refresh-button";

async function GreetingForThisVisit(): Promise<ReactNode> {
  const today = await demoToday();
  const { MOCK_SCENARIOS } = parseServerEnv(process.env);
  const instant = requestInstant(await headers(), MOCK_SCENARIOS);
  return (
    <ProfileGreeting dayPart={dayPartAt(instant)} today={today}>
      <DataFreshness today={today} />
    </ProfileGreeting>
  );
}

export function TopBar(): ReactNode {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-4 gap-y-4 md:gap-y-5 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:gap-x-3">
      <Brand placement="top-bar" />
      <div className="col-start-2 row-start-1 flex items-center gap-2">
        <RefreshButton />
        <AboutDialog opener="help" />
      </div>
      <div className="col-span-2 row-start-2 md:col-span-1 lg:col-start-1 lg:row-start-1">
        <Suspense fallback={<p className="h-[1.2em] w-60 animate-pulse rounded-6 bg-skeleton text-greeting" />}>
          <GreetingForThisVisit />
        </Suspense>
      </div>
      <div className="hidden md:col-start-2 md:row-start-2 md:block md:self-center md:justify-self-end lg:col-start-3 lg:row-start-1 lg:self-start">
        <ThemeControl />
      </div>
    </div>
  );
}
