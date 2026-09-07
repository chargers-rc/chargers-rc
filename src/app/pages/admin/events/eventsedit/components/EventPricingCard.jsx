import CMSInput from "@cms/CMSInput";
import { cmsLayout } from "@cms/layout";

export default function EventPricingCard({ event, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: cmsLayout.spacing.lg }}>

      {/* MEMBER / NON-MEMBER / JUNIOR */}
      <div style={cmsLayout.row}>
        <div style={cmsLayout.column}>
          <CMSInput
            label="Member Price"
            type="number"
            value={event.member_price ?? ""}
            onChange={(v) => onChange("member_price", v)}
          />
        </div>

        <div style={cmsLayout.column}>
          <CMSInput
            label="Non-Member Price"
            type="number"
            value={event.non_member_price ?? ""}
            onChange={(v) => onChange("non_member_price", v)}
          />
        </div>

        <div style={cmsLayout.column}>
          <CMSInput
            label="Junior Price"
            type="number"
            value={event.junior_price ?? ""}
            onChange={(v) => onChange("junior_price", v)}
          />
        </div>
      </div>
    </div>
  );
}
