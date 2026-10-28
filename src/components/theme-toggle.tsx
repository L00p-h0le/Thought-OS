"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "@phosphor-icons/react";

type Theme = "light" | "dark";

function getTheme(): Theme {
  const explicit = document.documentElement.dataset.theme;
  if (explicit === "light" || explicit === "dark") return explicit;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function subscribe(onChange: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: light)");
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributeFilter: ["data-theme"] });
  media.addEventListener("change", onChange);
  return () => {
    observer.disconnect();
    media.removeEventListener("change", onChange);
  };
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getTheme, () => "dark" as Theme);
  const isDark = theme === "dark";

  function toggle() {
    const next: Theme = isDark ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {}
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={isDark}
      className="btn btn-ghost btn-sm w-full justify-start"
    >
      {isDark ? (
        <Sun weight="bold" className="w-4 h-4" aria-hidden />
      ) : (
        <Moon weight="bold" className="w-4 h-4" aria-hidden />
      )}
      <span>Dark mode</span>
      <span
        aria-hidden
        className={`ml-auto h-4 w-7 rounded-full p-0.5 transition-default ${
          isDark ? "bg-accent" : "bg-surface-3"
        }`}
      >
        <span
          className={`block h-3 w-3 rounded-full bg-surface transition-default ${
            isDark ? "translate-x-3" : ""
          }`}
        />
      </span>
    </button>
  );
}
