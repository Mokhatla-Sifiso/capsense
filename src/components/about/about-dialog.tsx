import { CalendarBlank, Info, Monitor, Question, Receipt, User, X } from "@phosphor-icons/react/ssr";
import type { Icon as Glyph } from "@phosphor-icons/react";
import { type ReactNode, Suspense } from "react";
import { Dialog } from "@/components/dialog/dialog";
import { Icon } from "@/components/icon";
import { formatLongDay } from "@/lib/format";
import { demoToday } from "@/server/demo-today";

interface AboutDialogProps {
  opener: "help" | "learn-more";
}

interface Statement {
  glyph: Glyph;
  text: ReactNode;
}

async function FixedToday(): Promise<ReactNode> {
  return formatLongDay(await demoToday());
}

const STATEMENTS: readonly Statement[] = [
  { glyph: Info, text: "This dashboard shows sample (mocked) spending data." },
  {
    glyph: CalendarBlank,
    text: (
      <>
        &ldquo;Today&rdquo; is fixed at{" "}
        <Suspense fallback="a demo date">
          <FixedToday />
        </Suspense>
        .
      </>
    ),
  },
  { glyph: Receipt, text: "It is read-only. Nothing you do here changes an account." },
  { glyph: User, text: "There is no sign-in." },
  { glyph: Monitor, text: "Only your theme choice is saved, on this device. No data leaves your browser." },
  { glyph: Question, text: "CapSense is not an official Capitec product." },
];

const HELP_BUTTON =
  "grid size-11 place-items-center rounded-icon-button bg-soft text-foreground transition-colors hover:bg-track";
const LEARN_MORE_BUTTON =
  "min-h-11 rounded-pill bg-on-spend-button-bg px-5 font-semibold text-on-spend-button-fg focus-visible:outline-spend-fg";

export function AboutDialog({ opener }: AboutDialogProps): ReactNode {
  const fromHelp = opener === "help";

  return (
    <Dialog
      title="About this demo"
      trigger={fromHelp ? <Icon glyph={Question} size={22} /> : "Learn more"}
      triggerLabel={fromHelp ? "Help" : undefined}
      triggerClassName={fromHelp ? HELP_BUTTON : LEARN_MORE_BUTTON}
      closeIcon={<Icon glyph={X} size={20} />}
    >
      <ul className="grid gap-4">
        {STATEMENTS.map((statement) => (
          <li key={statement.glyph.displayName} className="flex items-start gap-3">
            <span className="grid size-8 shrink-0 place-items-center rounded-10 bg-soft text-heading">
              <Icon glyph={statement.glyph} size={18} />
            </span>
            <p className="pt-1">{statement.text}</p>
          </li>
        ))}
      </ul>
    </Dialog>
  );
}
