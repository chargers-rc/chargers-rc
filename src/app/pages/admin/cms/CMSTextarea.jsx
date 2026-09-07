import { cmsStyles } from "./styles";

export default function CMSTextarea({ label, value, onChange, name }) {
  const handleValue = (e) => {
    onChange(e.target.value);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {label && <label style={cmsStyles.label}>{label}</label>}
      <textarea
        name={name}
        value={value || ""}
        onChange={handleValue}
        style={cmsStyles.textarea}
      />
    </div>
  );
}
