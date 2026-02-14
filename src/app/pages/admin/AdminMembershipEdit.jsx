import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

export default function AdminMembershipEdit() {
  const { clubSlug, id } = useParams();
  const navigate = useNavigate();

  const [membership, setMembership] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [linkedUser, setLinkedUser] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [searchEmail, setSearchEmail] = useState("");
  const [foundUser, setFoundUser] = useState(null);
  const [linking, setLinking] = useState(false);

  useEffect(() => {
    loadMembership();
  }, []);

  async function loadMembership() {
    const { data, error } = await window.supabase
      .from("memberships")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      setErrorMsg("Failed to load membership");
      setLoading(false);
      return;
    }

    setMembership(data);

    if (data.user_id) {
      const { data: userProfile } = await window.supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user_id)
        .single();

      setLinkedUser(userProfile);
    }

    const { data: driverData } = await window.supabase
      .from("drivers")
      .select("*")
      .eq("membership_id", id);

    setDrivers(driverData || []);
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);

    const { error } = await window.supabase
      .from("memberships")
      .update({
        primary_first_name: membership.primary_first_name,
        primary_last_name: membership.primary_last_name,
        email: membership.email,
        membership_type: membership.membership_type,
        status: membership.status,
      })
      .eq("id", id);

    setSaving(false);

    if (error) {
      setErrorMsg("Failed to save changes");
      return;
    }

navigate(`/${clubSlug}/admin/memberships`);
  }

  async function searchForUser() {
    setFoundUser(null);

    const { data } = await window.supabase
      .from("profiles")
      .select("id, email")
      .eq("email", searchEmail)
      .single();

    setFoundUser(data || null);
  }

  async function linkUser() {
    if (!foundUser) return;

    setLinking(true);

    const { error } = await window.supabase.rpc("admin_link_membership", {
      p_membership_id: id,
      p_user_id: foundUser.id,
    });

    setLinking(false);

    if (error) {
      setErrorMsg("Failed to link user");
      return;
    }

    navigate(`/${clubSlug}/admin/memberships`);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 rounded-full border-2 border-slate-700 border-t-emerald-400 animate-spin" />
          <p className="text-slate-300 text-sm">Loading membership…</p>
        </div>
      </div>
    );
  }

  if (!membership) {
    return (
      <div className="min-h-screen bg-slate-950 text-red-400 p-6">
        Membership not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 px-4 py-10">
      <div className="max-w-2xl mx-auto space-y-10">

{/* BACK LINK */}
<button
  onClick={() => navigate(`/${clubSlug}/admin/memberships`)}
  className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
>
          ← Back to Memberships
        </button>

        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
          Edit Membership
        </h1>

        {errorMsg && (
          <p className="text-red-400 text-sm">{errorMsg}</p>
        )}

        {/* MEMBERSHIP FORM */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">
              First Name
            </label>
            <input
              type="text"
              value={membership.primary_first_name || ""}
              onChange={(e) =>
                setMembership({
                  ...membership,
                  primary_first_name: e.target.value,
                })
              }
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">
              Last Name
            </label>
            <input
              type="text"
              value={membership.primary_last_name || ""}
              onChange={(e) =>
                setMembership({
                  ...membership,
                  primary_last_name: e.target.value,
                })
              }
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">
              Email
            </label>
            <input
              type="email"
              value={membership.email || ""}
              onChange={(e) =>
                setMembership({
                  ...membership,
                  email: e.target.value,
                })
              }
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">
              Membership Type
            </label>
            <input
              type="text"
              value={membership.membership_type || ""}
              onChange={(e) =>
                setMembership({
                  ...membership,
                  membership_type: e.target.value,
                })
              }
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">
              Status
            </label>
            <input
              type="text"
              value={membership.status || ""}
              onChange={(e) =>
                setMembership({
                  ...membership,
                  status: e.target.value,
                })
              }
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* LINKED USER */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">
              Linked User
            </label>
            {linkedUser ? (
              <p className="text-emerald-300 text-sm">
                {linkedUser.email} (User ID: {membership.user_id})
              </p>
            ) : (
              <p className="text-red-400 text-sm">Not linked</p>
            )}
          </div>
        </div>

        {/* SAVE BUTTON */}
        <button
          onClick={handleSave}
          disabled={saving}
          className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
            saving
              ? "bg-slate-700 text-slate-400 cursor-not-allowed"
              : "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
          }`}
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>

        {/* DRIVERS LIST */}
        <div className="border-t border-slate-800 pt-6 space-y-4">
          <h2 className="text-xl font-semibold text-slate-50">Drivers</h2>

          {drivers.length === 0 ? (
            <p className="text-slate-400 text-sm">
              No drivers for this membership.
            </p>
          ) : (
            <ul className="space-y-2">
              {drivers.map((d) => (
                <li
                  key={d.id}
                  className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-200"
                >
                  {d.first_name} {d.last_name}{" "}
                  {d.is_junior && (
                    <span className="text-emerald-300">(Junior)</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* LINK USER */}
        <div className="border-t border-slate-800 pt-6 space-y-4">
          <h2 className="text-xl font-semibold text-slate-50">Link User</h2>

          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Search email…"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:ring-2 focus:ring-emerald-500"
            />
            <button
              onClick={searchForUser}
              className="rounded-full bg-slate-800 text-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-700 transition-colors"
            >
              Search
            </button>
          </div>

          {foundUser && (
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 space-y-2">
              <p className="font-medium text-slate-100">Found User:</p>
              <p className="text-sm text-slate-300">Email: {foundUser.email}</p>
              <p className="text-sm text-slate-300">ID: {foundUser.id}</p>

              <button
                onClick={linkUser}
                disabled={linking}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  linking
                    ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                    : "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                }`}
              >
                {linking ? "Linking…" : "Link This User"}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
