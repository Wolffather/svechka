import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "svechka_theme";
const THEME_COLOR: Record<Theme, string> = { light: "#f6f1e6", dark: "#2d2b2b" };

function readStoredTheme(): Theme | null {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : null;
}

function systemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function updateThemeColorMeta(theme: Theme) {
  const meta = document.querySelector('meta[name="theme-color"]:not([media])');
  if (meta) {
    meta.setAttribute("content", THEME_COLOR[theme]);
  } else {
    const created = document.createElement("meta");
    created.setAttribute("name", "theme-color");
    created.setAttribute("content", THEME_COLOR[theme]);
    document.head.appendChild(created);
  }
}

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => readStoredTheme() ?? systemTheme());
  // Compares actual values (not just "have I run yet") so React StrictMode's
  // dev-only double-invoke of effects can't mistake a re-run for a real change.
  const previousTheme = useRef<Theme | null>(null);

  // Only the *change* itself should crossfade — not ordinary content mounting on page
  // load or route navigation, which also happens to run through this effect once.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    updateThemeColorMeta(theme);

    const changed = previousTheme.current !== null && previousTheme.current !== theme;
    previousTheme.current = theme;
    if (!changed) {
      return;
    }

    const root = document.documentElement;
    root.classList.add("theme-transitioning");
    const timeoutId = window.setTimeout(() => root.classList.remove("theme-transitioning"), 400);
    return () => window.clearTimeout(timeoutId);
  }, [theme]);

  // Before the user picks a theme explicitly, keep following the OS setting live
  // (e.g. an automatic day/night switch) instead of freezing whatever it was on first load.
  useEffect(() => {
    if (readStoredTheme() !== null) {
      return;
    }
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (event: MediaQueryListEvent) => setThemeState(event.matches ? "dark" : "light");
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  function setTheme(next: Theme) {
    localStorage.setItem(STORAGE_KEY, next);
    setThemeState(next);
  }

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
