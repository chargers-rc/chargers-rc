import { Link, useParams } from "react-router-dom";

export default function AdminDashboard() {
  const { clubSlug } = useParams();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-10">

        {/* PAGE HEADER */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Admin Dashboard
          </h1>
        </div>

        {/* GRID OF ADMIN SECTIONS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
{/* EVENTS */}
<Link
  to={`/${clubSlug}/admin/events`}
  className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 hover:bg-slate-900 transition-colors cursor-pointer flex flex-col justify-between"
>
  <div>
    <h2 className="text-xl font-semibold text-slate-50 mb-2">
      Manage Events
    </h2>
    <p className="text-sm text-slate-400">
      Add, edit, and manage all club events.
    </p>
  </div>
</Link>

{/* MEMBERSHIPS */}
<Link
  to={`/${clubSlug}/admin/memberships`}
  className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 hover:bg-slate-900 transition-colors cursor-pointer flex flex-col justify-between"
>
            <div>
              <h2 className="text-xl font-semibold text-slate-50 mb-2">
                Manage Memberships
              </h2>
              <p className="text-sm text-slate-400">
                View, edit, and link member accounts.
              </p>
            </div>
          </Link>

          {/* FUTURE TILES */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 opacity-60 flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-300 mb-2">
                Coming Soon
              </h2>
              <p className="text-sm text-slate-500">
                Drivers, Calendar, Reports, and more.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
