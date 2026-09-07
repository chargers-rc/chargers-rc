import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/supabaseClient";

import CMSCard from "@cms/CMSCard";
import CMSToggle from "@cms/CMSToggle";
import CMSButton from "@cms/CMSButton";

import EventBasicsCard from "./components/EventBasicsCard";
import EventTimingCard from "./components/EventTimingCard";
import EventNominationsCard from "./components/EventNominationsCard";
import EventPricingCard from "./components/EventPricingCard";
import AdvancedSettingsCard from "./components/AdvancedSettingsCard";
import SaveActions from "./components/SaveActions";
import EventMerchandiseCard from "./components/EventMerchandiseCard";
import EventPreviewModal from "./components/EventPreviewModal";

import { cmsStyles } from "@cms/styles";

const initialEventState = {
  id: null,
  club_id: null,
  name: "",
  description: "",
  event_type: "",
  event_date: "",
  is_multi_day: false,
  days: [],
  event_opens_at: "",
  drivers_briefing_at: "",
  event_closes_at: "",
  track: "",
  logourl: undefined,
  logo_file: null,
  classes: [],
  classes_by_day: {},
  class_limit: 3,
  preference_enabled: true,
  nominations_open: "",
  nominations_close: "",
  member_price: "",
  non_member_price: "",
  junior_price: "",
  is_published: true,
  location: "",
  created_at: null,
  merchandise: [],
  available_classes: [],
};

export default function AdminEventEdit() {
  // ----------------------------------------
  // CONSTANTS
  // ----------------------------------------
  const navigate = useNavigate();
  const { clubSlug, id } = useParams();
  const isNew = !id || id === "new";

  // ----------------------------------------
  // STATE
  // ----------------------------------------
  const [eventData, setEventData] = useState(initialEventState);
  const [eventTypes, setEventTypes] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [trackClassCache, setTrackClassCache] = useState({});
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // ----------------------------------------
  // LOAD CLUB FOR NEW EVENT
  // ----------------------------------------
  useEffect(() => {
    if (!isNew) return;

    async function loadClub() {
      const { data } = await supabase
        .from("clubs")
        .select("id")
        .eq("slug", clubSlug)
        .single();

      if (data) {
        setEventData((prev) => ({
          ...prev,
          club_id: data.id,
        }));
      }
    }

    loadClub();
  }, [isNew, clubSlug]);

  // ----------------------------------------
  // LOAD EVENT FOR EDITING
  // ----------------------------------------
  useEffect(() => {
    if (isNew) return;

    async function loadEvent() {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        setError("Failed to load event.");
        setLoading(false);
        return;
      }

setEventData({
  ...initialEventState,
  ...data,

  // FIXED: preserve empty string, only null/undefined become null
  logourl: data.logourl ?? null,

  days: Array.isArray(data.days)
    ? data.days.map((d) =>
        typeof d === "string" ? { date: d, label: "" } : d
      )
    : [],
  classes_by_day: data.classes_by_day || {},
  merchandise: Array.isArray(data.merchandise)
    ? data.merchandise
    : data.merchandise || [],
  classes: Array.isArray(data.classes) ? data.classes : [],
  is_multi_day: !!data.is_multi_day,
});

      setLoading(false);
    }

    loadEvent();
  }, [id, isNew]);

  // ----------------------------------------
  // LOAD EVENT TYPES
  // ----------------------------------------
  useEffect(() => {
    if (!eventData.club_id) return;

    async function loadEventTypes() {
      const { data } = await supabase
        .from("club_event_types")
        .select("*")
        .eq("club_id", eventData.club_id)
        .order("sort_order", { ascending: true });

      if (data) setEventTypes(data);
    }

    loadEventTypes();
  }, [eventData.club_id]);

  // ----------------------------------------
  // LOAD TRACKS
  // ----------------------------------------
  useEffect(() => {
    if (!eventData.club_id) return;

    async function loadTracks() {
      const { data } = await supabase
        .from("club_tracks")
        .select("*")
        .eq("club_id", eventData.club_id)
        .order("name", { ascending: true });

      if (data) setTracks(data);
    }

    loadTracks();
  }, [eventData.club_id]);

  // ----------------------------------------
  // LOAD CLASSES FOR TRACK
  // ----------------------------------------
  const loadClassesForTrack = async (trackId) => {
    if (!trackId) return [];

    if (trackClassCache[trackId]) {
      return trackClassCache[trackId];
    }

    const { data } = await supabase
      .from("club_track_classes")
      .select(`
        class_id,
        club_classes (
          id,
          name,
          description,
          order_index
        )
      `)
      .eq("track_id", trackId)
      .order("order_index", { foreignTable: "club_classes" });

    const classes = (data || []).map((row) => row.club_classes);

    setTrackClassCache((prev) => ({
      ...prev,
      [trackId]: classes,
    }));

    return classes;
  };

  // ----------------------------------------
  // AUTO-SET TRACK IF ONLY ONE EXISTS
  // ----------------------------------------
  useEffect(() => {
    if (tracks.length === 1 && !eventData.track) {
      setEventData((prev) => ({
        ...prev,
        track: tracks[0].id,
      }));
    }
  }, [tracks, eventData.track]);

  // ----------------------------------------
  // FIELD CHANGE HANDLER
  // ----------------------------------------
  const handleFieldChange = async (field, value) => {
    setEventData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (field === "track") {
      const classes = await loadClassesForTrack(value);
      setEventData((prev) => ({
        ...prev,
        available_classes: classes,
      }));
    }
  };

  // ----------------------------------------
  // CLASSES CHANGE HANDLER
  // ----------------------------------------
  const handleClassesChange = (classesByDay) => {
    setEventData((prev) => ({
      ...prev,
      classes_by_day: classesByDay,
    }));
  };

  // ----------------------------------------
  // DELETE HANDLER
  // ----------------------------------------
  const handleDelete = async () => {
    if (isNew) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this event? This cannot be undone."
    );
    if (!confirmed) return;

    setSaving(true);
    setError(null);

    const { error } = await supabase.from("events").delete().eq("id", id);

    if (error) {
      setError("Failed to delete event.");
      setSaving(false);
      return;
    }

    setSaving(false);
    navigate(`/${clubSlug}/app/admin/events`);
  };

  // ----------------------------------------
  // CANCEL HANDLER
  // ----------------------------------------
  const handleCancel = () => {
    navigate(`/${clubSlug}/app/admin/events`);
  };

  // ----------------------------------------
  // SAVE HANDLER (FINAL)
  // ----------------------------------------
  const handleSave = async () => {
    setSaving(true);
    setError(null);

    const err = validateEvent();
    if (err) {
      setError(err);
      setSaving(false);
      return;
    }

    const finalLogoUrl =
      typeof eventData.logourl === "string" ? eventData.logourl : "";

    const clean = (obj) => JSON.parse(JSON.stringify(obj ?? null));

    const payload = clean({
      club_id: eventData.club_id,
      name: eventData.name || "",
      description: eventData.description || "",
      event_type: eventData.event_type || "",
      track: eventData.track || "",
      logourl: finalLogoUrl,
      is_multi_day: eventData.is_multi_day || false,
      event_date: eventData.is_multi_day
        ? null
        : eventData.event_date || null,
      days: eventData.is_multi_day
        ? (eventData.days || []).map((d) => ({
            date: d?.date || "",
            label: d?.label || "",
          }))
        : [],
      nominations_open: eventData.nominations_open || null,
      nominations_close: eventData.nominations_close || null,
      classes_by_day: eventData.is_multi_day
        ? clean(eventData.classes_by_day || {})
        : {},
      classes: eventData.is_multi_day
        ? []
        : eventData.classes || [],
      merchandise: clean(eventData.merchandise || []),
    });

    let result;
    if (isNew) {
      result = await supabase
        .from("events")
        .insert(payload)
        .select()
        .single();
    } else {
      result = await supabase
        .from("events")
        .update(payload)
        .eq("id", id)
        .select()
        .single();
    }

    if (result.error) {
      console.error(result.error);
      setError("Failed to save event.");
      setSaving(false);
      return;
    }

    setSaving(false);
    navigate(`/${clubSlug}/app/admin/events`);
  };

  // ----------------------------------------
  // VALIDATION
  // ----------------------------------------
  const validateEvent = () => {
    if (!eventData.name) return "Event name is required.";
    if (!eventData.event_type) return "Event type is required.";
    if (!eventData.track) return "Track is required.";

    if (!eventData.is_multi_day && !eventData.event_date)
      return "Event date is required for single-day events.";

    if (eventData.is_multi_day) {
      if (!Array.isArray(eventData.days) || eventData.days.length === 0)
        return "At least one day is required.";

      for (const d of eventData.days) {
        if (!d.date) return "Each day must have a date.";
        if (typeof d.label !== "string") return "Day label must be a string.";
      }
    }

    if (eventData.is_multi_day) {
      if (typeof eventData.classes_by_day !== "object")
        return "classes_by_day must be an object.";

      for (const key of Object.keys(eventData.classes_by_day)) {
        if (!Array.isArray(eventData.classes_by_day[key]))
          return `classes_by_day[${key}] must be an array.`;
      }
    }

    return null;
  };

  // ----------------------------------------
  // RENDER
  // ----------------------------------------
  return (
    <div style={cmsStyles.pageContainer}>
      <div style={cmsStyles.pageContent}>
        <div style={cmsStyles.sectionHeader}>
          <h1 style={cmsStyles.sectionHeaderTitle}>
            {isNew ? "Create Event" : "Edit Event"}
          </h1>
          <p style={cmsStyles.sectionHeaderSubtitle}>
            Configure event details, track, nominations, pricing, merchandise, and settings.
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: "12px 16px",
              borderRadius: "6px",
              backgroundColor: "#FEE2E2",
              color: "#991B1B",
              fontSize: "14px",
              marginBottom: "20px",
            }}
          >
            {error}
          </div>
        )}

        {loading ? (
          <CMSCard>
            <div style={{ padding: "16px" }}>Loading event…</div>
          </CMSCard>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            <CMSCard
              title="Event Details"
              actions={
                <CMSToggle
                  label="Published"
                  checked={eventData.is_published}
                  onChange={(checked) =>
                    handleFieldChange("is_published", checked)
                  }
                />
              }
            >
              <EventBasicsCard
                event={eventData}
                onChange={handleFieldChange}
                eventTypes={eventTypes}
                tracks={tracks}
              />
            </CMSCard>

            <CMSCard title="Timing">
              <EventTimingCard event={eventData} onChange={handleFieldChange} />
            </CMSCard>

            <CMSCard title="Nominations">
              <EventNominationsCard
                event={eventData}
                onChange={handleFieldChange}
                onClassesChange={handleClassesChange}
              />
            </CMSCard>

            <CMSCard title="Pricing">
              <EventPricingCard event={eventData} onChange={handleFieldChange} />
            </CMSCard>

            <CMSCard title="Merchandise / Add-Ons">
              <EventMerchandiseCard
                event={eventData}
                onChange={handleFieldChange}
              />
            </CMSCard>

            <CMSCard title="Advanced Settings">
              <AdvancedSettingsCard
                event={eventData}
                onChange={handleFieldChange}
              />
            </CMSCard>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <CMSButton variant="primary" onClick={() => setPreviewOpen(true)}>
                Preview Event
              </CMSButton>

              <SaveActions
                isNew={isNew}
                saving={saving}
                onSave={handleSave}
                onCancel={handleCancel}
                onDelete={handleDelete}
              />
            </div>
          </div>
        )}

        {previewOpen && (
          <EventPreviewModal
            event={eventData}
            onClose={() => setPreviewOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
