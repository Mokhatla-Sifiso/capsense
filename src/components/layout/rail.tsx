import type { ReactNode } from "react";
import { Brand } from "@/components/brand/brand";
import { Icon } from "@/components/icon";
import { AboutCard } from "./about-card";
import { JumpToHeading } from "./jump-to-heading";
import { PAGE_SECTIONS } from "./page-sections";

interface RailProps {
  today: string;
  learnMore: ReactNode;
}

export function Rail({ today, learnMore }: RailProps): ReactNode {
  return (
    <div className="flex min-h-full flex-col px-4 pt-5.5 pb-5 tall:sticky tall:top-0 tall:h-dvh tall:min-h-0">
      <div className="px-3">
        <Brand placement="rail" />
      </div>

      <nav aria-labelledby="rail-label" className="mt-10">
        <p id="rail-label" className="px-3 text-xs font-semibold text-muted-foreground">
          On this page
        </p>
        <ul className="mt-3 grid gap-1.5">
          {PAGE_SECTIONS.map((section) => (
            <li key={section.headingId}>
              <JumpToHeading
                headingId={section.headingId}
                className="flex min-h-12 w-full items-center gap-3 rounded-icon-button p-1 text-left text-control leading-tight font-semibold text-foreground transition-colors hover:bg-soft"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-12 bg-soft text-heading">
                  <Icon glyph={section.glyph} size={20} />
                </span>
                {section.title}
              </JumpToHeading>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-auto pt-10">
        <AboutCard today={today} action={learnMore} />
      </div>
    </div>
  );
}
