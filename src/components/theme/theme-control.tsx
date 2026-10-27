import { Monitor, Moon, Sun } from "@phosphor-icons/react/ssr";
import type { ReactNode } from "react";
import { Icon } from "@/components/icon";
import { ThemeSwitch } from "./theme-switch";

const OPTIONS = [
  { value: "light", label: "Light", icon: <Icon glyph={Sun} size={20} /> },
  { value: "dark", label: "Dark", icon: <Icon glyph={Moon} size={20} /> },
  { value: "system", label: "System", icon: <Icon glyph={Monitor} size={20} /> },
] as const;

export function ThemeControl(): ReactNode {
  return <ThemeSwitch options={OPTIONS} />;
}

export function ThemeRow(): ReactNode {
  return (
    <div className="flex items-center justify-between rounded-panel bg-card px-4 py-3 shadow-card">
      <p className="text-h3 font-bold">Theme</p>
      <ThemeControl />
    </div>
  );
}
