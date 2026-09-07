import CMSToggle from "@cms/CMSToggle";
import CMSInput from "@cms/CMSInput";
import { cmsLayout } from "@cms/layout";

export default function AdvancedSettingsCard({ event, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: cmsLayout.spacing.lg }}>
      <CMSToggle
        label="Preferences Enabled"
        checked={!!event.preference_enabled}
        onChange={(v) => onChange("preference_enabled", v)}
      />

      <CMSInput
        label="Max Classes Per Driver"
        type="number"
        value={event.class_limit ?? ""}
        onChange={(v) => onChange("class_limit", v)}
      />
    </div>
  );
}
