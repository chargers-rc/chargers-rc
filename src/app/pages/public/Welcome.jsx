import { useOutletContext, Link } from "react-router-dom";

export default function Welcome() {
  const { club } = useOutletContext();

  // ⭐ Prevent Welcome from running before club is loaded
  if (!club) {
    return <div className="p-6 text-center">Loading…</div>;
  }

  const clubSlug = club.slug;

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-6">
      <div className="max-w-sm w-full text-center space-y-6">

        {/* Logo placeholder */}
        <div className="mx-auto h-20 w-20 bg-gray-300 rounded-full" />

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold leading-snug">
            Welcome to {club.name}
          </h1>

          <p className="text-gray-600 text-sm">
            Join the club or sign in to get started.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-4 pt-2">
          <Link
            to={`/${clubSlug}/login`}
            className="w-full py-3 bg-black text-white rounded-md font-semibold shadow-sm"
          >
            Log In
          </Link>

          <Link
            to={`/${clubSlug}/signup`}
            className="w-full py-3 border border-gray-300 rounded-md font-semibold bg-white shadow-sm"
          >
            Create Account
          </Link>
        </div>

      </div>
    </div>
  );
}
