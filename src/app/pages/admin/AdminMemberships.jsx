import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

export default function AdminMemberships() {
  const { clubSlug } = useParams();
  const [memberships, setMemberships] = useState([]);

  useEffect(() => {
    loadMemberships();
  }, []);

  async function loadMemberships() {
    const { data, error } = await window.supabase
      .from("household_memberships")
      .select("*")
      .order("primary_last_name", { ascending: true });

    if (!error) setMemberships(data || []);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 px-4 py-10">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* PAGE HEADER */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Memberships
          </h1>

<Link
  to={`/${clubSlug}/admin/memberships/new`}
  className="rounded-full bg-emerald-500 text-slate-950 px-5 py-2.5 text-sm font-semibold hover:bg-emerald-400 transition-colors"
>
            + Add Membership
          </Link>
        </div>

        {/* MEMBERSHIP TABLE */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-900 text-slate-300 border-b border-slate-800">
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Duration</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Linked</th>
              </tr>
            </thead>

            <tbody>
              {memberships.map((m) => (
                <tr
                  key={m.id}
                  className="hover:bg-slate-800/60 transition cursor-pointer border-b border-slate-800"
                  onClick={() =>
                    (window.location.href = `/${clubSlug}/admin/memberships/${m.id}`)
                  }
                >
                  <td className="p-3 text-slate-100">
                    {m.primary_first_name} {m.primary_last_name}
                  </td>

                  <td className="p-3">
                    <span className="text-emerald-300 underline">
                      {m.email}
                    </span>
                  </td>

                  <td className="p-3 text-slate-300">
                    {m.membership_type || "—"}
                  </td>

                  <td className="p-3 text-slate-300">
                    {m.duration || "—"}
                  </td>

                  <td className="p-3 text-slate-300">
                    {m.status || "—"}
                  </td>

                  <td className="p-3">
                    {m.user_id ? (
                      <span className="text-emerald-400 font-medium">
                        Linked
                      </span>
                    ) : (
                      <span className="text-red-400 font-medium">
                        Unlinked
                      </span>
                    )}
                  </td>
                </tr>
              ))}

              {memberships.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="p-4 text-center text-slate-400"
                  >
                    No memberships found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
