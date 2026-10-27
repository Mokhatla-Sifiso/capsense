export const THEMES = ["light", "dark", "system"] as const;
export type Theme = (typeof THEMES)[number];

export const THEME_STORAGE_KEY = "capsense-theme";

export const APPLY_SAVED_THEME_SCRIPT = `(function(){try{var t=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

type Listener = () => void;

const listeners = new Set<Listener>();
let current: Theme | null = null;

function readSavedTheme(): Theme {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return THEMES.find((theme) => theme === saved) ?? "system";
  } catch {
    return "system";
  }
}

function saveTheme(theme: Theme): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    return;
  }
}

function applyTheme(theme: Theme): void {
  if (theme === "system") document.documentElement.removeAttribute("data-theme");
  else document.documentElement.setAttribute("data-theme", theme);
}

export function currentTheme(): Theme {
  current ??= readSavedTheme();
  return current;
}

export function chooseTheme(theme: Theme): void {
  current = theme;
  applyTheme(theme);
  saveTheme(theme);
  listeners.forEach((listener) => listener());
}

export function subscribeToTheme(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
