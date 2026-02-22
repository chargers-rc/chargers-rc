// src/components/ui/Header.jsx
console.log("Header: start render");

import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/supabaseClient";
import { useAuth } from "@app/providers/AuthProvider";
import { useMembership } from "@app/providers/MembershipProvider";

import rcracedayLogo from "../../assets/rcraceday_logo.png";
import chargersLogo from "../../assets/Chargers_RC_Logo_2026.png";

export default function Header({ club }) {
  const [open, setOpen] = useState(false);

  const { user } = useAuth();
  const { membership } = useMembership();

  console.log("PATH:", location.pathname);


  const homePath = club?.slug ? `/${club.slug}` : "/";

  const headerLogo =
    club?.slug === "chargers-rc" ? chargersLogo : rcracedayLogo;

  const userName =
    user?.user_metadata?.full_name ??
    user?.email ??
    null;

  const isMember = membership?.status === "active";
  const membershipLabel = isMember ? "Club Member" : "Non‑Member";

  async function handleLogout() {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Logout error:", err);
    }
  }

  return (
    <header className="w-full bg-header-bg border-b border-border shadow-sm">
      <div className="relative w-full max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">

        {/* LEFT: LOGO */}
        <Link to={homePath} className="flex items-center no-underline">
          <img
            src={headerLogo}
            alt="Header logo"
            className="h-12 w-auto object-contain"
          />
        </Link>

        {/* CENTER: NAV — perfectly centered */}
        <nav
          className="
            hidden md:flex
            absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
            items-center gap-10 font-medium
            text-header-link
          "
        >
          <Link
            to={homePath}
            className="no-underline text-header-link hover:text-header-linkHover transition"
          >
            Home
          </Link>

          {club?.slug && (
            <Link
              to={`/${club.slug}/events`}
              className="no-underline text-header-link hover:text-header-linkHover transition"
            >
              Events
            </Link>
          )}

          {club?.slug && (
            <Link
              to={`/${club.slug}/membership`}
              className="no-underline text-header-link hover:text-header-linkHover transition"
            >
              Membership
            </Link>
          )}
        </nav>

        {/* RIGHT: USER INFO */}
        <div className="hidden md:flex items-center gap-6 text-header-text">
          {user && (
            <div className="flex flex-col text-right leading-tight">
              <span className="font-semibold text-sm">{userName}</span>
              <span className="text-xs text-header-text-muted">
                {membershipLabel}
              </span>
            </div>
          )}

          {user ? (
            <button
              onClick={handleLogout}
              className="text-sm font-semibold hover:text-header-linkHover transition"
            >
              Logout
            </button>
          ) : (
            club?.slug && (
              <Link
                to={`/${club.slug}/login`}
                className="text-sm font-semibold no-underline text-header-link hover:text-header-linkHover transition"
              >
                Login
              </Link>
            )
          )}
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
          className="md:hidden justify-self-end p-2 rounded-md text-header-link hover:bg-surface-alt transition"
        >
          <svg
            className="h-7 w-7"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* ACCENT STRIPE */}
      <div className="h-1 w-full bg-header-accent" />

      {/* MOBILE NAV */}
      {open && (
        <div className="md:hidden bg-header-bg border-b border-border shadow-sm">
          <div className="px-4 py-3 space-y-2 font-medium text-header-link">
            <Link
              to={homePath}
              className="block py-2 no-underline text-header-link hover:text-header-linkHover transition"
              onClick={() => setOpen(false)}
            >
              Home
            </Link>

            {club?.slug && (
              <Link
                to={`/${club.slug}/events`}
                className="block py-2 no-underline text-header-link hover:text-header-linkHover transition"
                onClick={() => setOpen(false)}
              >
                Events
              </Link>
            )}

            {club?.slug && (
              <Link
                to={`/${club.slug}/membership`}
                className="block py-2 no-underline text-header-link hover:text-header-linkHover transition"
                onClick={() => setOpen(false)}
              >
                Membership
              </Link>
            )}

            {user && (
              <div className="pt-3 border-t border-border">
                <div className="text-sm font-semibold text-header-link">
                  {userName}
                </div>
                <div className="text-xs text-header-text-muted mb-3">
                  {membershipLabel}
                </div>

                <button
                  onClick={async () => {
                    await handleLogout();
                    setOpen(false);
                  }}
                  className="text-sm font-semibold hover:text-header-linkHover transition"
                >
                  Logout
                </button>
              </div>
            )}

            {!user && club?.slug && (
              <Link
                to={`/${club.slug}/login`}
                className="block py-2 no-underline text-header-link hover:text-header-linkHover transition"
                onClick={() => setOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
