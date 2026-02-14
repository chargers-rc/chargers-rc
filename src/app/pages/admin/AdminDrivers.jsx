import { useEffect, useMemo, useState } from "react";

export default function AdminDrivers() {
  const [drivers, setDrivers] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all"); // all | junior | senior

  const [selectedDriverId, setSelectedDriverId] = useState(null);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    driver_type: "",
    is_junior: false,
    membership_id: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    const { data: driverRows } = await window.supabase
      .from("drivers")
      .select("*")
      .order("last_name", { ascending: true })
      .order("first_name", { ascending: true });

    const { data: membershipRows } = await window.supabase
      .from("household_memberships")
      .select("*")
      .order("primary_last_name", { ascending: true });

    setDrivers(driverRows || []);
    setMemberships(membershipRows || []);
    setLoading(false);
  }

  const membershipById = useMemo(() => {
    const map = {};
    memberships.forEach((m) => {
      map[m.id] = m;
    });
    return map;
  }, [memberships]);

  function resetForm() {
    setSelectedDriverId(null);
    setForm({
      first_name: "",
      last_name: "",
      email: "",
      driver_type: "",
      is_junior: false,
      membership_id: "",
    });
  }

  function startNewDriver() {
    resetForm();
  }

  function startEditDriver(driver) {
    setSelectedDriverId(driver.id);
    setForm({
      first_name: driver.first_name || "",
      last_name: driver.last_name || "",
      email: driver.email || "",
      driver_type: driver.driver_type || "",
      is_junior: !!driver.is_junior,
      membership_id: driver.membership_id || "",
    });
  }

  async function handleSave(e) {
    if (e?.preventDefault) e.preventDefault();

    const payload = {
      first_name: form.first_name || null,
      last_name: form.last_name || null,
      email: form.email || null,
      driver_type: form.driver_type || null,
      is_junior: !!form.is_junior,
      membership_id: form.membership_id || null,
    };

    if (selectedDriverId) {
      await window.supabase
        .from("drivers")
        .update(payload)
        .eq("id", selectedDriverId);
    } else {
      await window.supabase.from("drivers").insert(payload);
    }

    await loadData();
    resetForm();
  }

  async function handleDelete() {
    if (!selectedDriverId) return;
    if (!window.confirm("Delete this driver?")) return;

    await window.supabase.from("drivers").delete().eq("id", selectedDriverId);
    await loadData();
    resetForm();
  }

  const filteredDrivers = useMemo(() => {
    let list = [...drivers];

    if (filterType === "junior") {
      list = list.filter((d) => d.is_junior);
    } else if (filterType === "senior") {
      list = list.filter((d) => !d.is_junior);
    }

    if (search.trim() !== "") {
      const q = search.toLowerCase();
      list = list.filter((d) => {
        const name =
          ((d.first_name || "") + " " + (d.last_name || "")).toLowerCase();
        const email = (d.email || "").toLowerCase();
        return name.includes(q) || email.includes(q);
      });
    }

    return list;
  }, [drivers, filterType, search]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 rounded-full border-2 border-slate-700 border-t-emerald-400 animate-spin" />
          <p className="text-slate-300 text-sm">Loading drivers…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 px-4 py-10">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* PAGE HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Drivers
          </h1>

          <button
            onClick={startNewDriver}
            className="rounded-full bg-emerald-500 text-slate-950 px-5 py-2.5 text-sm font-semibold hover:bg-emerald-400 transition-colors"
          >
            + Add Driver
          </button>
        </div>

        {/* MAIN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT: DRIVER LIST */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-4">

              {/* Filters */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-200 mb-1">
                    Search
                  </label>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name or email…"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex gap-2">
                  {["all", "junior", "senior"].map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                        filterType === type
                          ? "bg-emerald-500 text-slate-950"
                          : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      {type === "all"
                        ? "All"
                        : type === "junior"
                        ? "Juniors"
                        : "Seniors"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Driver list */}
              {filteredDrivers.length === 0 ? (
                <p className="text-sm text-slate-400 mt-2">No drivers found.</p>
              ) : (
                <div className="mt-2 space-y-2">
                  {filteredDrivers.map((driver) => {
                    const membership =
                      driver.membership_id &&
                      membershipById[driver.membership_id];

                    const isSelected = selectedDriverId === driver.id;

                    return (
                      <button
                        key={driver.id}
                        type="button"
                        onClick={() => startEditDriver(driver)}
                        className={`w-full text-left rounded-xl border px-3 py-2 bg-slate-950 border-slate-800 hover:bg-slate-900 transition ${
                          isSelected
                            ? "ring-2 ring-emerald-500 border-emerald-500"
                            : ""
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-sm text-slate-100">
                              {(driver.first_name || "") +
                                " " +
                                (driver.last_name || "")}
                            </div>

                            {driver.email && (
                              <div className="text-xs text-slate-400">
                                {driver.email}
                              </div>
                            )}

                            <div className="text-xs text-slate-500 mt-1">
                              {driver.is_junior ? "Junior" : "Senior"}
                              {driver.driver_type
                                ? ` • ${driver.driver_type}`
                                : ""}
                              {membership && (
                                <>
                                  {" • "}
                                  Household:{" "}
                                  {membership.primary_first_name}{" "}
                                  {membership.primary_last_name}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: DRIVER EDITOR */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-4">
              <h2 className="text-xl font-semibold text-slate-50">
                {selectedDriverId ? "Edit Driver" : "Add Driver"}
              </h2>

              <form className="space-y-4" onSubmit={handleSave}>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={form.first_name}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        first_name: e.target.value,
                      }))
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
                    value={form.last_name}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        last_last: e.target.value,
                      }))
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
                    value={form.email}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">
                    Driver Type
                  </label>
                  <input
                    type="text"
                    value={form.driver_type}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        driver_type: e.target.value,
                      }))
                    }
                    placeholder="e.g. 1/10 Buggy, 1/8 Nitro…"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    id="is_junior"
                    type="checkbox"
                    checked={form.is_junior}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        is_junior: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                  />
                  <label
                    htmlFor="is_junior"
                    className="text-sm font-medium text-slate-200 select-none"
                  >
                    Junior driver
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">
                    Household Membership
                  </label>
                  <select
                    value={form.membership_id || ""}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        membership_id: e.target.value || "",
                      }))
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">No household linked</option>
                    {memberships.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.primary_first_name} {m.primary_last_name} —{" "}
                        {m.email || "no email"}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="submit"
                    className="rounded-full bg-emerald-500 text-slate-950 px-4 py-2 text-sm font-semibold hover:bg-emerald-400 transition-colors"
                  >
                    {selectedDriverId ? "Save Changes" : "Create Driver"}
                  </button>

                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-slate-800 transition-colors"
                  >
                    Clear
                  </button>

                  {selectedDriverId && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="rounded-full bg-red-500 text-slate-950 px-4 py-2 text-sm font-semibold hover:bg-red-400 transition-colors"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
