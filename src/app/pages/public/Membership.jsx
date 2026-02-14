import { useOutletContext, Link } from "react-router-dom";

export default function Membership() {
  const { club } = useOutletContext();
  const clubSlug = club?.slug;

  return (
    <div className="min-h-screen flex justify-center px-4 py-6">
      <div className="w-full max-w-xl">

        {/* Header */}
        <header className="mb-8">
          <h1 className="text-2xl font-semibold mb-2">
            Membership at {club?.name}
          </h1>
          <p className="text-gray-600 text-sm">
            Support the club and unlock full access.
          </p>
        </header>

        {/* Benefits */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Benefits</h2>
          <div className="border border-gray-200 rounded-md p-4 bg-white shadow-sm">
            <ul className="list-disc ml-5 text-gray-700 text-sm space-y-1">
              <li>Access to all club racing events</li>
              <li>Driver profiles and race history</li>
              <li>Setup sharing and tuning notes</li>
              <li>Discounted entry fees</li>
              <li>Support track maintenance and improvements</li>
            </ul>
          </div>
        </section>

        {/* Pricing Placeholder */}
        <section classname="mb-8">
          <h2 className="text-lg font-semibold mb-3">Membership Options</h2>
          <div className="border border-gray-200 rounded-md p-4 bg-white shadow-sm">
            <p className="text-gray-600 text-sm">
              Membership pricing will appear here.
            </p>
          </div>
        </section>

        {/* CTA */}
        {clubSlug && (
          <Link
            to={`/${clubSlug}/signup`}
            className="block w-full text-center py-3 bg-black text-white rounded-md font-semibold shadow-sm"
          >
            Create Account
          </Link>
        )}

      </div>
    </div>
  );
}
