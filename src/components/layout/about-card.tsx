import { Info } from "@phosphor-icons/react/ssr";
import { type ReactNode, Suspense } from "react";
import { Icon } from "@/components/icon";
import { formatDay } from "@/lib/format";
import { demoToday } from "@/server/demo-today";

interface AboutCardProps {
  action: ReactNode;
}

async function DemoDate(): Promise<ReactNode> {
  return formatDay(await demoToday());
}

export function AboutCard({ action }: AboutCardProps): ReactNode {
  return (
    <div className="rounded-panel bg-spend p-5 text-spend-fg">
      <span className="grid size-9 place-items-center rounded-circle bg-spend-fg text-spend">
        <Icon glyph={Info} size={20} />
      </span>
      <p className="mt-2 font-bold">About this demo</p>
      <p className="mt-1.5 text-sm text-spend-subtle">
        Sample data, fixed to{" "}
        <Suspense fallback="a demo date">
          <DemoDate />
        </Suspense>
        . Read-only.
      </p>
      <div className="mt-3.5">{action}</div>
    </div>
  );
}
