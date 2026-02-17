// src/components/ui/Header.jsx
console.log("Header: start render");

import { useState } from "react";
import { Link } from "react-router-dom";

function isValidLogoUrl(url) {
  if (!url) return false;
  try {
    const u = new URL(url);
    const badHosts = ["your-bucket-url", "example.com", "localhost-placeholder"];
    if (badHosts.some((h) => u.hostname.includes(h))) return false;
    if (!["http:", "https:"].includes(u.protocol)) return false;
    return true;
  } catch {
    return false;
  }
}

export default function Header({ club }) {
  const [open, setOpen] = useState(false);

  const logoSrc = isValidLogoUrl(club?.logo_url)
    ? club.logo_url
    : club?.logo ?? "/chargers-logo.png";

  return (
    <header className="w-full bg-white border-b border-border">
      <div className="w-full max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 no-underline">
          <img
            src={logoSrc}
            alt={`${club?.name ?? "Club"} logo`}
            className="h-12 w-auto object-contain"
            onError={(e) => {
              try {
                const el = e.currentTarget;
                if (el && !el.src.endsWith("/chargers-logo.png")) {
                  el.src = "/chargers-logo.png";
                }
              } catch {}
            }}
          />
        </Link>

        <nav className="hidden md:flex items-center gap-8 font-medium text-brand-secondary">
          <Link
            to="/"
            className="hover:text-brand-primary transition no-underline text-brand-secondary"
          >
            Home
          </Link>

          {club?.slug && (
            <Link
              to={`/${club.slug}/events`}
              className="hover:text-brand-primary transition no-underline text-brand-secondary"
            >
              Events
            </Link>
          )}

          {club?.slug && (
            <Link
              to={`/${club.slug}/membership`}
              className="hover:text-brand-primary transition no-underline text-brand-secondary"
            >
              Membership
            </Link>
          )}
        </nav>

        <button
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
          className="md:hidden p-2 rounded-md text-brand-secondary hover:bg-surface-alt transition"
        >
          <svg
            className="h-7 w-7"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {open ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      <div className="h-1 w-full bg-brand-primary" />

      {open && (
        <div className="md:hidden bg-white border-b border-border shadow-sm">
          <div className="px-4 py-3 space-y-2 font-medium text-brand-secondary">
            <Link
              to="/"
              className="block py-2 hover:text-brand-primary transition no-underline"
              onClick={() => setOpen(false)}
            >
              Home
            </Link>

            {club?.slug && (
              <Link
                to={`/${club.slug}/events`}
                className="block py-2 hover:text-brand-primary transition no-underline"
                onClick={() => setOpen(false)}
              >
                Events
              </Link>
            )}

            {club?.slug && (
              <Link
                to={`/${club.slug}/membership`}
                className="block py-2 hover:text-brand-primary transition no-underline"
                onClick={() => setOpen(false)}
              >
                Membership
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
