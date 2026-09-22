// apps/web/lib/theme.ts

"use client";

export type ThemeMode = "light" | "system" | "dark";

export const THEME_STORAGE_KEY =
  "allianceos-theme";

export function getStoredTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return "system";
  }

  const stored =
    window.localStorage.getItem(
      THEME_STORAGE_KEY,
    );

  if (
    stored === "light" ||
    stored === "dark" ||
    stored === "system"
  ) {
    return stored;
  }

  return "system";
}

export function applyTheme(
  mode: ThemeMode,
) {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;

  if (mode === "system") {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute(
      "data-theme",
      mode,
    );
  }
}

export function setTheme(
  mode: ThemeMode,
) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    THEME_STORAGE_KEY,
    mode,
  );

  applyTheme(mode);
}

export function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia(
    "(prefers-color-scheme: dark)",
  ).matches
    ? "dark"
    : "light";
}