export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="tabs">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`tab ${active === t.id ? "tab-active" : ""}`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
