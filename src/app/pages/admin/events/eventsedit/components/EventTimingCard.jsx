import CMSInput from "@cms/CMSInput";
import { cmsLayout } from "@cms/layout";

export default function EventTimingCard({ event, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: cmsLayout.spacing.lg }}>

      {/* ROW: OPENS + BRIEFING + CLOSES */}
      <div style={cmsLayout.row}>
        <div style={cmsLayout.column}>
          <CMSInput
            label="Event Opens At"
            type="datetime-local"
            value={event.event_opens_at || ""}
            onChange={(v) => onChange("event_opens_at", v)}
          />
        </div>

        <div style={cmsLayout.column}>
          <CMSInput
            label="Drivers Briefing At"
            type="datetime-local"
            value={event.drivers_briefing_at || ""}
            onChange={(v) => onChange("drivers_briefing_at", v)}
          />
        </div>

        <div style={cmsLayout.column}>
          <CMSInput
            label="Event Closes At"
            type="datetime-local"
            value={event.event_closes_at || ""}
            onChange={(v) => onChange("event_closes_at", v)}
          />
        </div>
      </div>

      {/* LOCATION — FULL WIDTH */}
      <CMSInput
        label="Location"
        value={event.location || ""}
        onChange={(v) => onChange("location", v)}
      />
    </div>
  );
}
