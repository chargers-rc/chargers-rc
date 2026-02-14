import { useEffect, useState } from "react";

const TRACK_OPTIONS = ["Dirt Track", "SIC Surface"];

export default function AdminClassManager() {
  const [classes, setClasses] = useState([]);
  const [tracksByClass, setTracksByClass] = useState({});
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    class_name: "",
    tracks: [],
  });

  useEffect(() => {
    loadClasses();
  }, []);

  async function loadClasses() {
    setLoading(true);

    const { data: classRows } = await window.supabase
      .from("event_classes")
      .select("*")
      .order("class_name", { ascending: true });

    const { data: trackRows } = await window.supabase
      .from("class_tracks")
      .select("*");

    const map = {};
    (trackRows || []).forEach((t) => {
      if (!map[t.class_id]) map[t.class_id] = [];
      map[t.class_id].push(t.track);
    });

    setClasses(classRows || []);
    setTracksByClass(map);
    setLoading(false);
  }

  function resetForm() {
    setEditingId(null);
    setForm({ class_name: "", tracks: [] });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.class_name) return;

    let classId = editingId;

    if (editingId) {
      await window.supabase
        .from("event_classes")
        .update({ class_name: form.class_name })
        .eq("id", editingId);
    } else {
      const { data: newClass } = await window.supabase
        .from("event_classes")
        .insert({
          class_name: form.class_name,
          is_active: true,
        })
        .select("*")
        .single();

      classId = newClass.id;
    }

    await window.supabase.from("class_tracks").delete().eq("class_id", classId);

    const rows = form.tracks.map((track) => ({
      class_id: classId,
      track,
    }));

    if (rows.length > 0) {
      await window.supabase.from("class_tracks").insert(rows);
    }

    resetForm();
    await loadClasses();
  }

  function startEdit(cls) {
    setEditingId(cls.id);
    setForm({
      class_name: cls.class_name,
      tracks: tracksByClass[cls.id] || [],
    });
  }

  async function deleteClass(id) {
    if (!window.confirm("Delete this class?")) return;
    await window.supabase.from("event_classes").delete().eq("id", id);
    await loadClasses();
  }

  async function toggleActive(cls) {
    await window.supabase
      .from("event_classes")
      .update({ is_active: !cls.is_active })
      .eq("id", cls.id);
    await loadClasses();
  }

  function toggleTrack(track) {
    setForm((prev) => {
      const exists = prev.tracks.includes(track);
      return {
        ...prev,
        tracks: exists
          ? prev.tracks.filter((t) => t !== track)
          : [...prev.tracks, track],
      };
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 rounded-full border-2 border-slate-700 border-t-emerald-400 animate-spin" />
          <p className="text-slate-300 text-sm">Loading classes…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 px-4 py-10">
      <div className="max-w-4xl mx-auto space-y-10">

        {/* PAGE HEADER */}
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
          Class Manager
        </h1>

        {/* ADD / EDIT FORM */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-6">
          <h2 className="text-xl font-semibold text-slate-50">
            {editingId ? "Edit Class" : "Add Class"}
          </h2>

          <div className="space-y-4">
            {/* CLASS NAME */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">
                Class Name
              </label>
              <input
                type="text"
                value={form.class_name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, class_name: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* TRACKS */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">
                Tracks
              </label>
              <div className="space-y-2">
                {TRACK_OPTIONS.map((track) => (
                  <label
                    key={track}
                    className="flex items-center gap-2 text-slate-200"
                  >
                    <input
                      type="checkbox"
                      checked={form.tracks.includes(track)}
                      onChange={() => toggleTrack(track)}
                      className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                    />
                    <span className="text-sm">{track}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                className="rounded-full bg-emerald-500 text-slate-950 px-4 py-2 text-sm font-semibold hover:bg-emerald-400 transition-colors"
              >
                {editingId ? "Save Changes" : "Add Class"}
              </button>

              {editingId && (
                <button
                  onClick={resetForm}
                  className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* CLASS LIST */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-4">
          <h2 className="text-xl font-semibold text-slate-50">All Classes</h2>

          {classes.length === 0 ? (
            <p className="text-sm text-slate-400">No classes defined yet.</p>
          ) : (
            <div className="space-y-3">
              {classes.map((cls) => (
                <div
                  key={cls.id}
                  className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 px-4 py-3"
                >
                  <div className="space-y-1">
                    <div className="font-medium text-slate-100">
                      {cls.class_name}
                    </div>

                    <div className="text-xs text-slate-400">
                      Tracks:{" "}
                      {(tracksByClass[cls.id] || []).join(", ") || "None"}
                    </div>

                    {!cls.is_active && (
                      <div className="text-xs text-red-400">Inactive</div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleActive(cls)}
                      className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-medium text-slate-100 hover:bg-slate-800 transition-colors"
                    >
                      {cls.is_active ? "Disable" : "Enable"}
                    </button>

                    <button
                      onClick={() => startEdit(cls)}
                      className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-medium text-slate-100 hover:bg-slate-800 transition-colors"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => deleteClass(cls.id)}
                      className="rounded-full bg-red-500 text-slate-950 px-3 py-1 text-xs font-semibold hover:bg-red-400 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
