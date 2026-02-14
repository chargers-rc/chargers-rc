import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";

const TRACK_OPTIONS = ["Dirt Track", "SIC Surface"];

// Convert Supabase timestamp → datetime-local format
function toLocalInputValue(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const pad = (n) => n.toString().padStart(2, "0");

  return (
    date.getFullYear() +
    "-" +
    pad(date.getMonth() + 1) +
    "-" +
    pad(date.getDate()) +
    "T" +
    ":" +
    pad(date.getMinutes())
  );
}

export default function AdminEventEdit() {
  const { clubSlug, id } = useParams();
  const navigate = useNavigate();
  const isNew = id === "new";
  const [event, setEvent] = useState({
    name: "",
    event_date: "",
    description: "",
    logoUrl: "",
    track: "",
    nominations_open: "",
    nominations_close: "",
    member_price: 10,
    non_member_price: 20,
    junior_price: 0,
    preference_enabled: true,
    class_limit: 3,
  });

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [allTrackClasses, setAllTrackClasses] = useState([]);
  const [nominationClasses, setNominationClasses] = useState([]);

  const [scrolled, setScrolled] = useState(false);
  const [saving, setSaving] = useState(false);

  const enabledClasses = useMemo(
    () => nominationClasses.filter((c) => c.is_enabled),
    [nominationClasses]
  );

  useEffect(() => {
    if (!isNew) {
      loadEventAndClasses(id);
    }
  }, [id, isNew]);

  useEffect(() => {
    if (isNew && event.track) {
      loadTrackClasses(event.track);
    }
  }, [event.track, isNew]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function loadEventAndClasses(eventId) {
    const { data: dataEvent } = await window.supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .single();

    if (!dataEvent) return;

    setEvent({
      name: dataEvent.name || "",
      event_date: dataEvent.event_date || "",
      description: dataEvent.description || "",
      logoUrl: dataEvent.logoUrl || "",
      track: dataEvent.track || "",
      nominations_open: toLocalInputValue(dataEvent.nominations_open),
      nominations_close: toLocalInputValue(dataEvent.nominations_close),
      member_price: dataEvent.member_price ?? 10,
      non_member_price: dataEvent.non_member_price ?? 20,
      junior_price: dataEvent.junior_price ?? 0,
      preference_enabled: dataEvent.preference_enabled ?? true,
      class_limit: dataEvent.class_limit ?? 3,
    });

    if (dataEvent.track) {
      await loadTrackClasses(dataEvent.track, eventId);
    }
  }

  async function loadTrackClasses(track, eventId = null) {
    const { data: classRows } = await window.supabase
      .from("event_classes")
      .select("*")
      .eq("track", track)
      .eq("is_active", true)
      .order("class_name", { ascending: true });

    const all = classRows || [];
    setAllTrackClasses(all);

    if (!eventId) {
      setNominationClasses(
        all.map((cls, index) => ({
          class_id: cls.id,
          class_name: cls.class_name,
          is_enabled: false,
          order_index: index + 1,
        }))
      );
      return;
    }

    const { data: nomRows } = await window.supabase
      .from("nomination_classes")
      .select("*")
      .eq("event_id", eventId);

    const nomByClassId = {};
    (nomRows || []).forEach((n) => {
      nomByClassId[n.class_id] = n;
    });

    const merged = all.map((cls, index) => {
      const existing = nomByClassId[cls.id];
      return {
        class_id: cls.id,
        class_name: cls.class_name,
        is_enabled: existing ? existing.is_enabled : false,
        order_index: existing ? existing.order_index : index + 1,
      };
    });

    merged.sort((a, b) => a.order_index - b.order_index);
    setNominationClasses(merged);
  }

  function handleTrackChange(newTrack) {
    setEvent((prev) => ({ ...prev, track: newTrack }));

    if (newTrack) {
      if (isNew) {
        loadTrackClasses(newTrack);
      } else {
        loadTrackClasses(newTrack, null);
      }
    } else {
      setAllTrackClasses([]);
      setNominationClasses([]);
    }
  }

  function toggleClassEnabled(class_id) {
    setNominationClasses((prev) =>
      prev.map((c) =>
        c.class_id === class_id ? { ...c, is_enabled: !c.is_enabled } : c
      )
    );
  }

  function moveClass(class_id, direction) {
    setNominationClasses((prev) => {
      const sorted = [...prev].sort((a, b) => a.order_index - b.order_index);
      const index = sorted.findIndex((c) => c.class_id === class_id);
      if (index === -1) return prev;

      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= sorted.length) return prev;

      const temp = sorted[index];
      sorted[index] = sorted[newIndex];
      sorted[newIndex] = temp;

      return sorted.map((c, i) => ({ ...c, order_index: i + 1 }));
    });
  }

  async function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    setUploadError("");

    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError("File too large. Maximum size is 2MB.");
      return;
    }

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Invalid file type. Allowed: PNG, JPG, JPEG, WEBP.");
      return;
    }

setUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `event-${Date.now()}.${fileExt}`;
      const filePath = `event-logos/${fileName}`;

      const { error: uploadError } = await window.supabase.storage
        .from("event-logos")
        .upload(filePath, file);

      if (uploadError) {
        setUploadError("Upload failed. Please try again.");
        setUploading(false);
        return;
      }

      const { data: publicUrlData } = window.supabase.storage
        .from("event-logos")
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;

      setEvent((prev) => ({ ...prev, logoUrl: publicUrl }));
    } catch (err) {
      setUploadError("Unexpected error during upload.");
    }

    setUploading(false);
  }

  async function persistEventAndClasses({ forPreview = false } = {}) {
    const payload = {
      name: event.name,
      event_date: event.event_date,
      description: event.description,
      logoUrl: event.logoUrl,
      track: event.track,
      nominations_open: event.nominations_open,
      nominations_close: event.nominations_close,
      member_price: Number(event.member_price),
      non_member_price: Number(event.non_member_price),
      junior_price: Number(event.junior_price),
      preference_enabled: event.preference_enabled,
      class_limit:
        event.class_limit === "" ? null : Number(event.class_limit),
    };

    let eventId = id;

    if (isNew) {
      const { data, error } = await window.supabase
        .from("events")
        .insert(payload)
        .select("*")
        .single();

      if (error || !data) {
        if (!forPreview) {
          alert("Could not save event.");
        }
        return null;
      }

      eventId = data.id;
    } else {
      const { error } = await window.supabase
        .from("events")
        .update(payload)
        .eq("id", id);

      if (error) {
        if (!forPreview) {
          alert("Could not save event.");
        }
        return null;
      }
    }

    if (event.track) {
      const rows = nominationClasses.map((c) => ({
        event_id: eventId,
        class_id: c.class_id,
        is_enabled: c.is_enabled,
        order_index: c.order_index,
      }));

      await window.supabase
        .from("nomination_classes")
        .delete()
        .eq("event_id", eventId);

      if (rows.length > 0) {
        await window.supabase.from("nomination_classes").insert(rows);
      }
    }

    return eventId;
  }

  async function handlePreview() {
    const eventId = await persistEventAndClasses({ forPreview: true });
    if (!eventId) return;
    window.open(`/${clubSlug}/nominations/${eventId}/start`, "_blank");
  }

async function handleSubmit(e) {
    if (e?.preventDefault) e.preventDefault();
    setSaving(true);
    const eventId = await persistEventAndClasses({ forPreview: false });
    setSaving(false);
    if (!eventId) return;
    navigate(`/${clubSlug}/admin/events`);
  }

  const headerTitle =
    event.name.trim() !== "" ? event.name : "Untitled Event";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 pb-32">
      {/* STICKY HEADER */}
      <header
        className={`sticky top-0 z-40 transition-shadow border-b border-slate-800 bg-slate-950/95 backdrop-blur ${
          scrolled ? "shadow-lg" : ""
        }`}
      >
<div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
  <Link
    to={`/${clubSlug}/admin/events`}
    className="text-xs sm:text-sm text-slate-400 hover:text-slate-200 transition-colors"
  >
            ← Events
          </Link>

          <div className="flex-1 text-center text-sm sm:text-base font-semibold text-slate-50 truncate px-2">
            {headerTitle}
          </div>

          <div className="flex items-center gap-2">
            {!isNew && (
              <button
                type="button"
                onClick={handlePreview}
                className="hidden sm:inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-slate-800 transition-colors"
              >
                Preview
              </button>
            )}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className={`inline-flex items-center justify-center rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold transition-colors ${
                saving
                  ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                  : "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
              }`}
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </header>

{/* MAIN CONTENT */}
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
        {/* SUMMARY BANNER */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-1 text-sm">
          <div>
            <span className="font-semibold text-slate-100">
              Enabled Classes:
            </span>{" "}
            <span className="text-slate-300">{enabledClasses.length}</span>
          </div>
          <div>
            <span className="font-semibold text-slate-100">Preference:</span>{" "}
            <span className="text-slate-300">
              {event.preference_enabled ? "On" : "Off"}
            </span>
          </div>
          <div>
            <span className="font-semibold text-slate-100">Limit:</span>{" "}
            <span className="text-slate-300">
              {event.class_limit === "" || event.class_limit === null
                ? "Unlimited"
                : event.class_limit}
            </span>
          </div>
        </div>

        {/* EVENT BASICS */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-6">
          <h2 className="text-xl font-semibold text-slate-50">Event Basics</h2>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">
              Event Name
            </label>
            <textarea
              rows={2}
              value={event.name}
              onChange={(e) =>
                setEvent({ ...event, name: e.target.value })
              }
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">
              Event Date
            </label>
            <input
              type="date"
              value={event.event_date}
              onChange={(e) =>
                setEvent({ ...event, event_date: e.target.value })
              }
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">
              Track
            </label>
            <select
              value={event.track}
              onChange={(e) => handleTrackChange(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Select a track…</option>
              {TRACK_OPTIONS.map((track) => (
                <option key={track} value={track}>
                  {track}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">
              Event Details
            </label>
            <textarea
              rows={4}
              value={event.description}
              onChange={(e) =>
                setEvent({ ...event, description: e.target.value })
              }
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* CLASSES */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
          <h2 className="text-xl font-semibold text-slate-50">Classes</h2>

          {!event.track && (
            <p className="text-sm text-slate-400">
              Select a track to choose classes.
            </p>
          )}

          {event.track && nominationClasses.length === 0 && (
            <p className="text-sm text-slate-400">
              No classes defined for this track yet. Add them in Class Manager.
            </p>
          )}

          {event.track && nominationClasses.length > 0 && (
            <div className="space-y-2">
              {nominationClasses
                .slice()
                .sort((a, b) => a.order_index - b.order_index)
                .map((cls) => (
                  <div
                    key={cls.class_id}
                    className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 px-3 py-2"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={cls.is_enabled}
                        onChange={() => toggleClassEnabled(cls.class_id)}
                        className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                      />
                      <span className="text-sm text-slate-100">
                        {cls.class_name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        className="text-xs px-2 py-1 rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800"
                        onClick={() => moveClass(cls.class_id, -1)}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className="text-xs px-2 py-1 rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800"
                        onClick={() => moveClass(cls.class_id, 1)}
                      >
                        ↓
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

{/* NOMINATION WINDOW */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-6">
          <h2 className="text-xl font-semibold text-slate-50">
            Nomination Window
          </h2>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">
              Nominations Open
            </label>
            <input
              type="datetime-local"
              value={event.nominations_open}
              onChange={(e) =>
                setEvent({ ...event, nominations_open: e.target.value })
              }
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">
              Nominations Close
            </label>
            <input
              type="datetime-local"
              value={event.nominations_close}
              onChange={(e) =>
                setEvent({ ...event, nominations_close: e.target.value })
              }
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* ADVANCED PRICING & RULES */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <h2 className="text-xl font-semibold text-slate-50">
              Advanced Pricing & Rules
            </h2>
            <span className="text-xl text-slate-300">
              {showAdvanced ? "▲" : "▼"}
            </span>
          </div>

          {showAdvanced && (
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">
                  Member Class Price
                </label>
                <input
                  type="number"
                  value={event.member_price}
                  onChange={(e) =>
                    setEvent({ ...event, member_price: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">
                  Non‑Member Class Price
                </label>
                <input
                  type="number"
                  value={event.non_member_price}
                  onChange={(e) =>
                    setEvent({ ...event, non_member_price: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">
                  Junior Class Price
                </label>
                <input
                  type="number"
                  value={event.junior_price}
                  onChange={(e) =>
                    setEvent({ ...event, junior_price: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={event.preference_enabled}
                  onChange={(e) =>
                    setEvent({
                      ...event,
                      preference_enabled: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                />
                <label className="text-sm font-medium text-slate-200">
                  Enable Preference Class (optional free class)
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">
                  Class Limit (leave blank for unlimited)
                </label>
                <input
                  type="number"
                  value={event.class_limit ?? ""}
                  onChange={(e) =>
                    setEvent({
                      ...event,
                      class_limit:
                        e.target.value === "" ? "" : Number(e.target.value),
                    })
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* EVENT LOGO */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
          <h2 className="text-xl font-semibold text-slate-50">Event Logo</h2>

          {event.logoUrl && (
            <div className="w-full h-40 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center overflow-hidden">
              <img
                src={event.logoUrl}
                alt="Event Logo"
                className="w-full h-full object-contain"
              />
            </div>
          )}

          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="block w-full text-sm text-slate-200"
          />

          {uploading && (
            <p className="text-sm text-emerald-300">Uploading image…</p>
          )}

          {uploadError && (
            <p className="text-sm text-red-300">{uploadError}</p>
          )}
        </div>

        {/* BOTTOM SAVE BUTTON */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className={`w-full mt-2 rounded-full px-4 py-3 text-lg font-semibold transition-colors ${
            saving
              ? "bg-slate-700 text-slate-400 cursor-not-allowed"
              : "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
          }`}
        >
          {isNew ? "Create Event" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
