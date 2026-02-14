import { useEffect, useState } from "react";

export default function AdminNominations() {
  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState(null);

  const [event, setEvent] = useState(null);
  const [nominations, setNominations] = useState([]);
  const [entries, setEntries] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [classes, setClasses] = useState([]);

  const [activeTab, setActiveTab] = useState("drivers");

  useEffect(() => {
    loadUpcomingEvents();
  }, []);

  async function loadUpcomingEvents() {
    const today = new Date().toISOString().split("T")[0];

    const { data } = await window.supabase
      .from("events")
      .select("*")
      .gte("event_date", today)
      .order("event_date", { ascending: true });

    setEvents(data || []);

    if (data && data.length > 0) {
      setEventId(data[0].id);
    }
  }

  useEffect(() => {
    if (eventId) loadAll(eventId);
  }, [eventId]);

  async function loadAll(eventId) {
    const { data: eventData } = await window.supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .single();
    setEvent(eventData);

    const { data: nominationData } = await window.supabase
      .from("nominations")
      .select("*")
      .eq("event_id", eventId);
    setNominations(nominationData || []);

    const { data: entryData } = await window.supabase
      .from("nomination_entries")
      .select("*")
      .in(
        "nomination_id",
        nominationData?.map((n) => n.id) || []
      );
    setEntries(entryData || []);

    const driverIds = nominationData?.map((n) => n.driver_id) || [];
    const { data: driverData } = await window.supabase
      .from("drivers")
      .select("*")
      .in("id", driverIds);
    setDrivers(driverData || []);

    const { data: profileData } = await window.supabase
      .from("driver_profiles")
      .select("*")
      .in("driver_id", driverIds);
    setProfiles(profileData || []);

    const { data: classData } = await window.supabase
      .from("event_classes")
      .select("*")
      .eq("track", eventData.track);
    setClasses(classData || []);
  }

  function getDriver(driverId) {
    return drivers.find((d) => d.id === driverId);
  }

  function getProfile(driverId) {
    return profiles.find((p) => p.driver_id === driverId);
  }

  function getEntriesForNomination(nominationId) {
    return entries
      .filter((e) => e.nomination_id === nominationId)
      .sort((a, b) => a.order_index - b.order_index);
  }

  function getClassName(classId) {
    return classes.find((c) => c.id === classId)?.class_name || "";
  }

  function membershipLabel(type) {
    return type === "non_member" ? "Non Member" : "Member";
  }

  function generateCSV() {
    if (!event) return "";

    const header =
      "FirstName,LastName,ClassName,TransponderNumber,LocalMembershipType";

    const rows = [];

    nominations.forEach((nom) => {
      const driver = getDriver(nom.driver_id);
      if (!driver) return;

      const driverEntries = getEntriesForNomination(nom.id);

      driverEntries.forEach((entry) => {
        if (entry.is_preference) return;

        const className = getClassName(entry.class_id);

        rows.push([
          driver.first_name || "",
          driver.last_name || "",
          className,
          driver.transponder_number || "",
          membershipLabel(driver.membership_type),
        ]);
      });
    });

    rows.sort((a, b) => {
      const ln = a[1].localeCompare(b[1]);
      if (ln !== 0) return ln;
      const fn = a[0].localeCompare(b[0]);
      if (fn !== 0) return fn;
      return a[2].localeCompare(b[2]);
    });

    return (
      header +
      "\n" +
      rows.map((r) => r.join(",")).join("\n")
    );
  }

  function downloadCSV() {
    const csv = generateCSV();
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

    const filename = `${event.name}-${event.event_date}-livetime.csv`;

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const tabs = [
    { id: "drivers", label: "Drivers" },
    { id: "classes", label: "Classes" },
    { id: "export", label: "Export" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-8">

        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
          Admin — Nominations
        </h1>

        {/* EVENT SELECTOR */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200">
            Select Event
          </label>
          <select
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:ring-2 focus:ring-emerald-500"
            value={eventId || ""}
            onChange={(e) => setEventId(e.target.value)}
          >
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.name} — {ev.event_date}
              </option>
            ))}
          </select>
        </div>

        {event && (
          <>
            {/* TABS */}
            <div className="flex gap-2 border-b border-slate-800 pb-2">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
                    activeTab === t.id
                      ? "bg-slate-800 text-emerald-300 border border-slate-700 border-b-slate-800"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* DRIVERS TAB */}
            {activeTab === "drivers" && (
              <div className="space-y-4">
                {nominations
                  .slice()
                  .sort((a, b) => {
                    const da = getDriver(a.driver_id);
                    const db = getDriver(b.driver_id);
                    return (
                      da.last_name.localeCompare(db.last_name) ||
                      da.first_name.localeCompare(db.first_name)
                    );
                  })
                  .map((nom) => {
                    const driver = getDriver(nom.driver_id);
                    const profile = getProfile(nom.driver_id);
                    const driverEntries = getEntriesForNomination(nom.id);

                    return (
                      <div
                        key={nom.id}
                        className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-2"
                      >
                        <div className="text-lg font-semibold text-slate-50">
                          {driver.first_name} {driver.last_name}
                        </div>

                        <div className="text-sm text-slate-400">
                          Membership: {membershipLabel(driver.membership_type)}
                        </div>
                        <div className="text-sm text-slate-400">
                          Transponder: {driver.transponder_number || "—"}
                        </div>

                        <div className="pt-2">
                          <div className="font-medium text-slate-200">
                            Classes:
                          </div>
                          <ul className="list-disc ml-6 text-sm text-slate-300">
                            {driverEntries.map((e) => (
                              <li key={e.id}>
                                {getClassName(e.class_id)}
                                {e.is_preference && (
                                  <span className="text-emerald-300 ml-1">
                                    (Preference)
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

            {/* CLASSES TAB */}
            {activeTab === "classes" && (
              <div className="space-y-6">
                {classes
                  .slice()
                  .sort((a, b) => a.order_index - b.order_index)
                  .map((cls) => {
                    const classDrivers = nominations
                      .map((nom) => {
                        const driver = getDriver(nom.driver_id);
                        const driverEntries = getEntriesForNomination(nom.id);
                        const entry = driverEntries.find(
                          (e) => e.class_id === cls.id
                        );
                        return entry ? { driver, entry } : null;
                      })
                      .filter(Boolean);

                    return (
                      <div
                        key={cls.id}
                        className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-2"
                      >
                        <h2 className="text-xl font-semibold text-slate-50">
                          {cls.class_name}
                        </h2>

                        {classDrivers.length === 0 && (
                          <p className="text-sm text-slate-500">
                            No drivers in this class.
                          </p>
                        )}

                        {classDrivers.length > 0 && (
                          <ul className="list-disc ml-6 text-sm text-slate-300">
                            {classDrivers.map(({ driver, entry }) => (
                              <li key={driver.id}>
                                {driver.first_name} {driver.last_name}
                                {entry.is_preference && (
                                  <span className="text-emerald-300 ml-1">
                                    (Preference)
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}

            {/* EXPORT TAB */}
            {activeTab === "export" && (
              <div className="space-y-4">
                <button
                  onClick={downloadCSV}
                  className="rounded-full bg-emerald-500 text-slate-950 px-5 py-2.5 text-sm font-semibold hover:bg-emerald-400 transition-colors"
                >
                  Download LiveTime CSV
                </button>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                  <pre className="whitespace-pre-wrap text-sm text-slate-300">
                    {generateCSV()}
                  </pre>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
