"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  applyTheme,
  getStoredTheme,
  setTheme,
  type ThemeMode,
} from "@/lib/theme";

const themes: {
  mode: ThemeMode;
  label: string;
  description: string;
}[] = [
  {
    mode: "light",
    label: "Light",
    description: "Use a light appearance",
  },
  {
    mode: "system",
    label: "System",
    description: "Follow your device settings",
  },
  {
    mode: "dark",
    label: "Dark",
    description: "Use a dark appearance",
  },
];

/* =========================================================
   ICONS
========================================================= */

function SunIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />

      <path d="M12 2v2" />
      <path d="M12 20v2" />

      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />

      <path d="M2 12h2" />
      <path d="M20 12h2" />

      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function SystemIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="4"
        width="18"
        height="16"
        rx="2"
      />

      <path d="M12 4v16" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

/* =========================================================
   THEME ICON
========================================================= */

function ThemeIcon({
  mode,
}: {
  mode: ThemeMode;
}) {
  if (mode === "light") {
    return <SunIcon />;
  }

  if (mode === "dark") {
    return <MoonIcon />;
  }

  return <SystemIcon />;
}

/* =========================================================
   THEME SELECTOR
========================================================= */

export default function ThemeSelector() {
  const [open, setOpen] = useState(false);

  /*
   * Lazy initialization prevents the React 19
   * react-hooks/set-state-in-effect lint issue.
   */
  const [themeMode, setThemeMode] =
    useState<ThemeMode>(() => getStoredTheme());

  const containerRef =
    useRef<HTMLDivElement>(null);

  /* -------------------------------------------------------
     Apply selected theme
  ------------------------------------------------------- */

  useEffect(() => {
    applyTheme(themeMode);
  }, [themeMode]);

  /* -------------------------------------------------------
     Close when clicking outside
  ------------------------------------------------------- */

  useEffect(() => {
    function handleOutsideClick(
      event: MouseEvent,
    ) {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node,
        )
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick,
      );
    };
  }, []);

  /* -------------------------------------------------------
     Close on Escape
  ------------------------------------------------------- */

  useEffect(() => {
    function handleEscape(
      event: KeyboardEvent,
    ) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener(
      "keydown",
      handleEscape,
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, []);

  /* -------------------------------------------------------
     Theme change
  ------------------------------------------------------- */

  function handleThemeChange(
    mode: ThemeMode,
  ) {
    setThemeMode(mode);
    setTheme(mode);
    setOpen(false);
  }

  const selectedTheme =
    themes.find(
      (theme) => theme.mode === themeMode,
    ) ?? themes[1];

  return (
    <div
      ref={containerRef}
      className="appearance-control"
    >
      {/* =================================================
          TRIGGER
      ================================================= */}

      <button
        type="button"
        className="appearance-trigger"
        onClick={() =>
          setOpen((current) => !current)
        }
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Appearance: ${selectedTheme.label}`}
      >
        <ThemeIcon mode={themeMode} />

        <span className="appearance-trigger-label">
          Appearance
        </span>

        <ChevronIcon />
      </button>

      {/* =================================================
          DROPDOWN
      ================================================= */}

      {open && (
        <div
          className="appearance-menu"
          role="menu"
          aria-label="Appearance options"
        >
          {/* Header */}

          <div className="appearance-menu-header">
            <span>Appearance</span>

            <span>
              Choose your preference
            </span>
          </div>

          {/* Options */}

          <div className="appearance-options">
            {themes.map((theme) => {
              const active =
                theme.mode === themeMode;

              return (
                <button
                  key={theme.mode}
                  type="button"
                  role="menuitemradio"
                  aria-checked={active}
                  className={
                    active
                      ? "appearance-option active"
                      : "appearance-option"
                  }
                  onClick={() =>
                    handleThemeChange(
                      theme.mode,
                    )
                  }
                >
                  {/* Icon */}

                  <span className="appearance-option-icon">
                    <ThemeIcon
                      mode={theme.mode}
                    />
                  </span>

                  {/* Text */}

                  <span className="appearance-option-content">
                    <span className="appearance-option-label">
                      {theme.label}
                    </span>

                    <span className="appearance-option-description">
                      {theme.description}
                    </span>
                  </span>

                  {/* Selected */}

                  {active && (
                    <span className="appearance-check">
                      <CheckIcon />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}