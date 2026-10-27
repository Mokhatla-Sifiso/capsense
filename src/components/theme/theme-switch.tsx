"use client";

import { type ReactNode, useId, useSyncExternalStore } from "react";
import { type Theme, chooseTheme, currentTheme, subscribeToTheme } from "@/lib/theme";

interface ThemeOption {
  value: Theme;
  label: string;
  icon: ReactNode;
}

interface ThemeSwitchProps {
  options: readonly ThemeOption[];
}

const OPTION = "grid size-11 cursor-pointer place-items-center rounded-10 transition-colors lg:size-9";
const FOCUS =
  "has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-ring";
const SELECTED = "bg-primary text-primary-foreground";
const UNSELECTED = "text-muted-foreground hover:text-foreground";

export function ThemeSwitch({ options }: ThemeSwitchProps): ReactNode {
  const theme = useSyncExternalStore(subscribeToTheme, currentTheme, () => "system");
  const group = useId();

  return (
    <div role="radiogroup" aria-label="Theme" className="inline-flex gap-1 rounded-icon-button bg-soft p-1">
      {options.map((option) => (
        <label key={option.value} className={`${OPTION} ${FOCUS} ${theme === option.value ? SELECTED : UNSELECTED}`}>
          <input
            type="radio"
            name={group}
            value={option.value}
            checked={theme === option.value}
            onChange={() => chooseTheme(option.value)}
            className="sr-only"
          />
          <span className="sr-only">{option.label}</span>
          {option.icon}
        </label>
      ))}
    </div>
  );
}
