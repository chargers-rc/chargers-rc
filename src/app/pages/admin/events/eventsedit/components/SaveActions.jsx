import CMSButton from "@cms/CMSButton";
import { cmsLayout } from "@cms/layout";

export default function SaveActions({
  isNew,
  saving,
  onSave,
  onCancel,
  onDelete,
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: cmsLayout.spacing.md,
        marginTop: cmsLayout.spacing.lg,
      }}
    >
      <div style={{ display: "flex", gap: cmsLayout.spacing.sm }}>
        {!isNew && (
          <CMSButton variant="danger" onClick={onDelete} disabled={saving}>
            Delete Event
          </CMSButton>
        )}
      </div>

      <div style={{ display: "flex", gap: cmsLayout.spacing.sm }}>
        <CMSButton variant="secondary" onClick={onCancel} disabled={saving}>
          Cancel
        </CMSButton>
        <CMSButton variant="primary" onClick={onSave} disabled={saving}>
          {saving ? "Saving…" : "Save Event"}
        </CMSButton>
      </div>
    </div>
  );
}
