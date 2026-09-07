import CMSSelect from "@cms/CMSSelect";
import CMSButton from "@cms/CMSButton";

export default function SortableClassItem({
  value,
  availableClasses,
  onChange,
  onRemove,
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: "12px",
      }}
    >
      {/* CLASS SELECTOR */}
      <div style={{ flex: 1 }}>
        <CMSSelect
          label="Class Name"
          value={value || ""}
          onChange={onChange}
          options={
            availableClasses.length > 0
              ? availableClasses.map((cls) => ({
                  label: cls,
                  value: cls,
                }))
              : []
          }
          placeholder={
            availableClasses.length === 0
              ? "No classes available"
              : "Select class..."
          }
        />
      </div>

      {/* REMOVE BUTTON */}
      <CMSButton
        variant="danger"
        onClick={onRemove}
        style={{
          height: "38px",
          padding: "8px 12px",
        }}
      >
        Remove
      </CMSButton>
    </div>
  );
}
