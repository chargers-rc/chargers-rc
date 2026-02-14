import { useOutletContext, Link } from "react-router-dom";
import { useAuth } from "@app/providers/AuthProvider";

export default function Home() {
  const { club } = useOutletContext();
  const { user } = useAuth();

  const clubSlug = club?.slug;
  const isLoggedIn = !!user;

  return (
    <div className="min-h-screen flex justify-center px-4 py-6">
      <div className="w-full max-w-xl">

        {/* Club Header */}
        <header className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-14 w-14 rounded-full bg-gray-300" />
            <div>
              <h1 className="text-2xl font-semibold">
                {club?.name || "Club"}
              </h1>
              <p className="text-gray-600 text-sm">
                Your home for racing, events, and community.
              </p>
            </div>
          </div>

          <p className="text-sm text-gray-600">
            {isLoggedIn ? "Logged in" : "Browsing as guest"}
          </p>
        </header>

        {/* Club News */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Club News</h2>
          <div className="border border-gray-200 rounded-md p-4 bg-white shadow-sm">
            <p className="text-gray-600 text-sm">
              News will appear here.
            </p>
          </div>
        </section>

        {/* Next Event */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Next Event</h2>
          <div className="border border-gray-200 rounded-md p-4 bg-white shadow-sm">
            <p className="text-gray-600 text-sm">
              Next event will appear here.
            </p>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>

          <div className="grid grid-cols-2 gap-3">

            {clubSlug && (
              <Link
                to={`/${clubSlug}/events`}
                className="border border-gray-200 rounded-md p-3 text-sm text-center bg-white shadow-sm"
              >
                Events
              </Link>
            )}

            {clubSlug && (
              <Link
                to={`/${clubSlug}/calendar`}
                className="border border-gray-200 rounded-md p-3 text-sm text-center bg-white shadow-sm"
              >
                Calendar
              </Link>
            )}

            <div className="border border-gray-200 rounded-md p-3 text-sm text-center bg-white shadow-sm opacity-50">
              Results (members only)
            </div>

            {clubSlug && (
              <Link
                to={`/${clubSlug}/profile/drivers`}
                className="border border-gray-200 rounded-md p-3 text-sm text-center bg-white shadow-sm"
              >
                Driver Manager
              </Link>
            )}

            <div className="border border-gray-200 rounded-md p-3 text-sm text-center bg-white shadow-sm opacity-50">
              Setups (members only)
            </div>

            {clubSlug && (
              <Link
                to={`/${clubSlug}/membership`}
                className="border border-gray-200 rounded-md p-3 text-sm text-center bg-white shadow-sm"
              >
                Membership
              </Link>
            )}
          </div>
        </section>

        {/* Auth Links */}
        {!isLoggedIn && clubSlug && (
          <section className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Get Started</h2>
            <div className="flex flex-col gap-2">
              <Link
                to={`/${clubSlug}/login`}
                className="w-full text-center py-2 border border-gray-300 rounded-md text-sm bg-white shadow-sm"
              >
                Member Login
              </Link>
              <Link
                to={`/${clubSlug}/signup`}
                className="w-full text-center py-2 bg-black text-white rounded-md text-sm shadow-sm"
              >
                Create Account
              </Link>
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
