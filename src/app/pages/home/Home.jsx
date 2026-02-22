// src/app/pages/Home.jsx
import { Link, useOutletContext } from "react-router-dom";
import { useAuth } from "@app/providers/AuthProvider";
import trackHero from "@/assets/chargers_track_overhead.jpg";

export default function Home() {
  const { club } = useOutletContext();
  const { user } = useAuth();

  const clubSlug = club?.slug;
  const isLoggedIn = !!user;

  const logoSrc =
    club?.logo_url ??
    club?.logo ??
    "/chargers-logo.png";

  return (
    <div className="min-h-screen w-full bg-surface-alt text-text-base">
      {/* HERO */}
      <section className="relative w-full overflow-hidden rounded-b-3xl shadow-[0_24px_60px_rgba(0,0,0,0.8)]">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src={trackHero}
            alt="Chargers RC track"
            className="w-full h-full object-cover blur-md scale-110"
          />
          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/75 to-black/95" />
          {/* Carbon-fibre style texture */}
          <div className="absolute inset-0 opacity-30 mix-blend-overlay bg-[radial-gradient(circle_at_0_0,#ffffff12,transparent_40%),radial-gradient(circle_at_100%_100%,#ffffff12,transparent_40%)]" />
        </div>

        {/* Foreground content */}
        <div className="relative px-5 pt-16 pb-12 flex flex-col items-center text-center text-white">
          {/* Accent glow bar */}
          <div className="mb-6 h-1.5 w-24 rounded-full bg-brand-primary shadow-[0_0_25px_rgba(0,114,206,0.9)]" />

          <img
            src={logoSrc}
            alt={`${club?.name ?? "Club"} logo`}
            className="h-28 w-auto mb-5 object-contain drop-shadow-[0_12px_30px_rgba(0,0,0,0.9)]"
          />

          <h1 className="text-3xl font-semibold tracking-tight mb-2">
            {club?.name ?? "Your Club"}
          </h1>

          <p className="text-brand-primary text-sm font-medium mb-4">
            Queensland&apos;s Premier 1/10th Off Road Racing RC Club
          </p>

          <p className="text-xs text-white/70">
            {isLoggedIn ? (
              <span className="text-brand-primary font-medium">
                You&apos;re logged in
              </span>
            ) : (
              <span>Browsing as guest</span>
            )}
          </p>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <main className="px-4 py-8 space-y-8 max-w-4xl mx-auto">
        {/* CLUB NEWS */}
        <section>
          <h2 className="text-sm font-semibold tracking-[0.18em] uppercase text-text-muted mb-3">
            Club News
          </h2>
          <div className="bg-[rgba(15,18,30,0.95)] rounded-2xl border border-white/5 p-4 shadow-[0_18px_45px_rgba(0,0,0,0.65)]">
            <p className="text-xs text-text-muted leading-relaxed">
              No news posted yet. Stay tuned for updates from the club.
            </p>
          </div>
        </section>

        {/* NEXT EVENT */}
        <section>
          <h2 className="text-sm font-semibold tracking-[0.18em] uppercase text-text-muted mb-3">
            Next Event
          </h2>
          <div className="bg-[rgba(15,18,30,0.95)] rounded-2xl border border-white/5 p-4 shadow-[0_18px_45px_rgba(0,0,0,0.65)]">
            <p className="text-xs text-text-muted leading-relaxed">
              The next event will appear here once scheduled.
            </p>
          </div>
        </section>

        {/* QUICK ACTIONS */}
        <section>
          <h2 className="text-sm font-semibold tracking-[0.18em] uppercase text-text-muted mb-3">
            Quick Actions
          </h2>

          <div className="grid grid-cols-2 gap-4">
            {clubSlug && (
              <Link
                to={`/${clubSlug}/events`}
                className="bg-[rgba(15,18,30,0.98)] rounded-2xl border border-white/5 px-3 py-4 text-center text-xs font-semibold text-white shadow-[0_18px_45px_rgba(0,0,0,0.7)] active:scale-[0.97] transition-transform hover:border-brand-primary/70 hover:text-brand-secondary"
              >
                Events
              </Link>
            )}

            {clubSlug && (
              <Link
                to={`/${clubSlug}/calendar`}
                className="bg-[rgba(15,18,30,0.98)] rounded-2xl border border-white/5 px-3 py-4 text-center text-xs font-semibold text-white shadow-[0_18px_45px_rgba(0,0,0,0.7)] active:scale-[0.97] transition-transform hover:border-brand-primary/70 hover:text-brand-secondary"
              >
                Calendar
              </Link>
            )}

            <div className="bg-[rgba(10,12,20,0.98)] rounded-2xl border border-white/5 px-3 py-4 text-center text-[0.7rem] text-text-muted shadow-[0_14px_35px_rgba(0,0,0,0.7)]">
              Results (members only)
            </div>

            {clubSlug && (
              <Link
                to={`/${clubSlug}/profile/drivers`}
                className="bg-[rgba(15,18,30,0.98)] rounded-2xl border border-white/5 px-3 py-4 text-center text-xs font-semibold text-white shadow-[0_18px_45px_rgba(0,0,0,0.7)] active:scale-[0.97] transition-transform hover:border-brand-primary/70 hover:text-brand-secondary"
              >
                Driver Manager
              </Link>
            )}

            {clubSlug && (
              <Link
                to={`/${clubSlug}/membership`}
                className="bg-[rgba(15,18,30,0.98)] rounded-2xl border border-white/5 px-3 py-4 text-center text-xs font-semibold text-white shadow-[0_18px_45px_rgba(0,0,0,0.7)] active:scale-[0.97] transition-transform hover:border-brand-primary/70 hover:text-brand-secondary col-span-2"
              >
                Membership
              </Link>
            )}
          </div>
        </section>

        {/* AUTH LINKS */}
        {!isLoggedIn && clubSlug && (
          <section>
            <h2 className="text-sm font-semibold tracking-[0.18em] uppercase text-text-muted mb-3">
              Get Started
            </h2>

            <div className="flex flex-col gap-3">
              <Link
                to={`/${clubSlug}/login`}
                className="w-full text-center text-xs font-semibold rounded-2xl border border-white/10 bg-[rgba(18,22,32,0.98)] text-white py-3 shadow-[0_16px_40px_rgba(0,0,0,0.75)] active:scale-[0.97] transition-transform hover:border-brand-primary/70"
              >
                Member Login
              </Link>

              <Link
                to={`/${clubSlug}/signup`}
                className="w-full text-center text-xs font-semibold rounded-2xl bg-brand-primary text-white py-3 shadow-[0_18px_45px_rgba(0,114,206,0.9)] active:scale-[0.97] transition-transform hover:bg-brand-secondary"
              >
                Create Account
              </Link>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
