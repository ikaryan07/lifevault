"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
}

interface ThemeContext {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContext>({
  theme: "system",
  setTheme: () => {},
  resolvedTheme: "light",
});

export function ThemeProvider({
  children,
  defaultTheme = "system",
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = localStorage.getItem("homepin:theme") as Theme | null;
    if (stored) setTheme(stored);

    // Bootstrap accessibility preferences from storage so they persist across loads.
    try {
      const a11y = localStorage.getItem("homepin:accessibility");
      if (a11y) {
        const settings = JSON.parse(a11y);
        if (settings.fontSize) {
          document.documentElement.style.fontSize = `${settings.fontSize}px`;
        }
        document.documentElement.classList.toggle(
          "high-contrast",
          !!settings.highContrast
        );
        document.documentElement.classList.toggle(
          "reduce-motion",
          !!settings.reducedMotion
        );
      }
    } catch {
      // ignore malformed preferences
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;

    function applyTheme(t: Theme) {
      if (t === "system") {
        const systemDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        root.classList.toggle("dark", systemDark);
        setResolvedTheme(systemDark ? "dark" : "light");
      } else {
        root.classList.toggle("dark", t === "dark");
        setResolvedTheme(t);
      }
    }

    applyTheme(theme);
    localStorage.setItem("homepin:theme", theme);

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    function handleChange() {
      if (theme === "system") applyTheme("system");
    }
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
