import CMSInput from "@cms/CMSInput";
import CMSSelect from "@cms/CMSSelect";
import CMSTextarea from "@cms/CMSTextarea";
import CMSImageUpload from "@cms/CMSImageUpload";
import CMSToggle from "@cms/CMSToggle";

import { AddButton, DeleteButton } from "@cms/CMSButtonSet";
import { cmsLayout } from "@cms/layout";
import { supabase } from "@/supabaseClient";

export default function EventBasicsCard({
  event,
  onChange,
  eventTypes = [],
  tracks = [],
}) {
  const isMulti = !!event.is_multi_day;

  const days = Array.isArray(event.days)
    ? event.days.map((d) =>
        typeof d === "string" ? { date: d, label: "" } : d
      )
    : [];

  const addDay = () => {
    onChange("days", [...days, { date: "", label: "" }]);
  };

  const updateDayDate = (i, value) => {
    const next = [...days];
    next[i].date = value;
    onChange("days", next);
  };

  const updateDayLabel = (i, value) => {
    const next = [...days];
    next[i].label = value;
    onChange("days", next);
  };

  const removeDay = (i) => {
    const next = [...days];
    next.splice(i, 1);
    onChange("days", next);
  };

  const safeDescription =
    typeof event.description === "string"
      ? event.description
      : event.description?.value ||
        event.description?.text ||
        event.description?.richText ||
        "";

  const trackOptions = tracks.map((t) => ({
    label: t.name,
    value: t.id,
  }));

  // Upload logo to Supabase
  const uploadLogo = async (file, clubId) => {
    if (!file || !clubId) return null;

    const path = `${clubId}/event-logos/${file.name}`;

    const { error } = await supabase.storage
      .from("club-assets")
      .upload(path, file, { upsert: true });

    if (error) {
      console.error("UPLOAD ERROR:", error);
      return null;
    }

    const { data } = supabase.storage
      .from("club-assets")
      .getPublicUrl(path);

    return data.publicUrl;
  };

  // 🔍 Debug: see exactly what EventBasicsCard is getting for the logo
  console.log("EventBasicsCard LOGO DEBUG:", {
    logourl: event.logourl,
    logo_file: event.logo_file,
    valueProp: event.logourl || null,
    filePreviewProp: event.logo_file || null,
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: cmsLayout.spacing.lg,
      }}
    >
      <CMSInput
        label="Event Name"
        value={event.name || ""}
        onChange={(value) => onChange("name", value)}
      />

      <CMSToggle
        label="Multi-Day Event?"
        checked={isMulti}
        onChange={(checked) => {
          onChange("is_multi_day", checked);

          if (!checked) {
            const first = days[0]?.date || event.event_date || "";
            onChange("event_date", first);
            onChange("days", []);
          } else {
            const first = event.event_date || "";
            onChange(
              "days",
              first ? [{ date: first, label: "" }] : []
            );
          }
        }}
      />

      {!isMulti && (
        <CMSInput
          label="Event Date"
          type="date"
          value={event.event_date || ""}
          onChange={(value) => onChange("event_date", value)}
        />
      )}

      {isMulti && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: cmsLayout.spacing.md,
            padding: "12px",
            border: "1px solid #E5E7EB",
            borderRadius: "8px",
            background: "#FAFAFA",
          }}
        >
          <div style={{ fontWeight: 600 }}>Event Days</div>

          {days.length === 0 && (
            <div style={cmsLayout.muted}>No days added yet.</div>
          )}

          {days.map((day, i) => (
            <div key={i} style={cmsLayout.row}>
              <div style={cmsLayout.column}>
                <CMSInput
                  label={`Day ${i + 1} Date`}
                  type="date"
                  value={day.date || ""}
                  onChange={(value) => updateDayDate(i, value)}
                />

                <CMSInput
                  label={`Day ${i + 1} Name`}
                  value={day.label || ""}
                  onChange={(value) => updateDayLabel(i, value)}
                />
              </div>

              <DeleteButton onClick={() => removeDay(i)}>
                Remove
              </DeleteButton>
            </div>
          ))}

          <AddButton onClick={addDay}>Add Day</AddButton>
        </div>
      )}

      <CMSSelect
        label="Event Type"
        value={event.event_type || ""}
        onChange={(value) => onChange("event_type", value)}
        options={eventTypes.map((t) => ({
          label: t.label,
          value: t.value,
        }))}
        placeholder="Select type..."
      />

      <CMSSelect
        label="Track"
        value={event.track || ""}
        options={trackOptions}
        placeholder="Select track..."
        onChange={(value) => onChange("track", value)}
      />

      <CMSTextarea
        label="Description"
        value={safeDescription}
        onChange={(value) => onChange("description", value)}
      />

      {/* ⭐ Correct props for CMSImageUpload */}
      <CMSImageUpload
        label="Event Logo"
        value={event.logourl || null}          // ⭐ REQUIRED
        filePreview={event.logo_file || null}  // ⭐ ONLY File objects
        onChange={async (file) => {
          onChange("logo_file", file);

          if (file === null) return;

          const url = await uploadLogo(file, event.club_id);
          if (url) onChange("logourl", url);
        }}
      />
    </div>
  );
}
