// src/app/providers/ThemeProvider.jsx
import React from "react";

export default function ThemeProvider({ children }) {
  return (
    <div
      data-theme-root
      style={{
        //
        // BRAND COLOURS (Chargers RC) — primary changed to pink for link color
        //
        "--brand-primary": "#FF2D95", // pink links
        "--brand-secondary": "#0A1A2F",
        "--brand-accent": "#FFC300",

        //
        // SURFACES
        //
        "--brand-surface": "#FFFFFF",
        "--brand-surface-alt": "#F5F7FA",

        //
        // TEXT
        //
        "--brand-text": "#0A1A2F",
        "--brand-text-muted": "#4B5563",

        //
        // BORDERS
        //
        "--brand-border": "#E5E7EB",

        //
        // MIRROR VARIABLES (for components using --color-*)
        //
        "--color-primary": "var(--brand-primary)",
        "--color-primary-dark": "var(--brand-secondary)",
        "--color-primary-light": "#E6F2FF",

        "--color-surface": "var(--brand-surface)",
        "--color-surface-alt": "var(--brand-surface-alt)",

        "--color-text": "var(--brand-text)",
        "--color-text-muted": "var(--brand-text-muted)",

        "--color-accent": "var(--brand-accent)",

        //
        // RADIUS + SHADOWS
        //
        "--radius-card": "1rem",
        "--shadow-card": "0 6px 18px rgba(0,0,0,0.08)",
      }}
      className="
        min-h-screen
        bg-[var(--brand-surface-alt)]
        text-[var(--brand-text)]
        font-sans
      "
    >
      {children}
    </div>
  );
}
