// src/app/providers/ThemeProvider.jsx
import { useEffect } from "react";

export default function ThemeProvider({ children }) {
  useEffect(() => {
    const root = document.documentElement;

    /* BRAND COLORS */
    root.style.setProperty("--brand-surface", "#0d0d12");
    root.style.setProperty("--brand-surface-alt", "#0f1a2e");

    root.style.setProperty("--brand-text", "#ffffff");
    root.style.setProperty("--brand-text-muted", "#b3b3b3");

    root.style.setProperty("--brand-primary", "#00438a");
    root.style.setProperty("--brand-secondary", "#66A8FF");
    root.style.setProperty("--brand-accent", "#FFC300");

    root.style.setProperty("--brand-border", "#1f2a38");

    /* HEADER COLORS */
    root.style.setProperty("--header-bg", "#ffffff");

    root.style.setProperty("--header-text", "#111111");
    root.style.setProperty("--header-text-muted", "#555555");

    root.style.setProperty("--header-link", "#111111");
    root.style.setProperty("--header-link-hover", "#00438a");

    /* ⭐ ACTIVE LINK — NOT BLUE */
    root.style.setProperty("--header-link-active", "#8a004c");

    /* Stripe stays blue */
    root.style.setProperty("--header-accent", "var(--brand-primary)");

    /* TYPOGRAPHY */
    root.style.setProperty("--font-family", "var(--site-font)");
    root.style.setProperty("--font-size-base", "16px");
    root.style.setProperty("--font-size-sm", "14px");
    root.style.setProperty("--font-size-lg", "18px");

    root.style.setProperty("--font-weight-normal", "400");
    root.style.setProperty("--font-weight-medium", "500");
    root.style.setProperty("--font-weight-bold", "600");

    /* HEADINGS */
    root.style.setProperty("--heading-xl", "2rem");
    root.style.setProperty("--heading-lg", "1.5rem");
    root.style.setProperty("--heading-md", "1.25rem");
    root.style.setProperty("--heading-sm", "1.125rem");
  }, []);

  return children;
}
