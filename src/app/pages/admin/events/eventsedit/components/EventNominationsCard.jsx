import CMSInput from "@cms/CMSInput";
import CMSSelect from "@cms/CMSSelect";
import CMSButton from "@cms/CMSButton";
import { cmsLayout } from "@cms/layout";

export default function EventNominationsCard({
  event,
  onChange,
  onClassesChange,
}) {
  const availableClasses = event.available_classes || [];
  const isMulti = !!event.is_multi_day;

  // Days now objects: { date, label }
  const days = Array.isArray(event.days)
    ? event.days.map((d) =>
        typeof d === "string" ? { date: d, label: "" } : d
      )
    : [];

  // IMMUTABLE NORMALIZATION — FIXES PHANTOM DAY BUG
  const rawClassesByDay = event.classes_by_day || {};
  const classesByDay = { ...rawClassesByDay };

  days.forEach((dayObj) => {
    const key = dayObj.date;
    if (!Array.isArray(classesByDay[key])) {
      classesByDay[key] = [];
    }
  });

  const updateDayClasses = (dayKey, newList) => {
    onClassesChange({
      ...classesByDay,
      [dayKey]: newList,
    });
  };

  const addClassToDay = (dayKey) => {
    updateDayClasses(dayKey, [...classesByDay[dayKey], ""]);
  };

  const updateClassInDay = (dayKey, index, value) => {
    const next = [...classesByDay[dayKey]];
    next[index] = value;
    updateDayClasses(dayKey, next);
  };

  const removeClassFromDay = (dayKey, index) => {
    updateDayClasses(
      dayKey,
      classesByDay[dayKey].filter((_, i) => i !== index)
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: cmsLayout.spacing.lg }}>

      {/* NOMINATIONS OPEN / CLOSE */}
      <div style={cmsLayout.row}>
        <div style={cmsLayout.column}>
          <CMSInput
            label="Nominations Open"
            type="datetime-local"
            value={event.nominations_open || ""}
            onChange={(v) => onChange("nominations_open", v)}
          />
        </div>

        <div style={cmsLayout.column}>
          <CMSInput
            label="Nominations Close"
            type="datetime-local"
            value={event.nominations_close || ""}
            onChange={(v) => onChange("nominations_close", v)}
          />
        </div>
      </div>

      {/* MULTI-DAY CLASS ASSIGNMENT */}
      {isMulti ? (
        <div style={{ display: "flex", flexDirection: "column", gap: cmsLayout.spacing.lg }}>
          {days.map((dayObj) => {
            const dayKey = dayObj.date;
            const dayLabel = dayObj.label || dayObj.date;

            return (
              <div
                key={dayKey}
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
                <div style={{ fontWeight: 600 }}>{dayLabel}</div>

                {classesByDay[dayKey].map((cls, index) => (
                  <div key={index} style={cmsLayout.row}>
                    <div style={cmsLayout.column}>
                      <CMSSelect
                        label={`Class ${index + 1}`}
                        value={cls}
                        onChange={(value) =>
                          updateClassInDay(dayKey, index, value)
                        }
                        options={availableClasses.map((c) => ({
                          label: c.name,
                          value: c.id,
                        }))}
                        placeholder="Select class..."
                      />
                    </div>

                    <CMSButton
                      variant="danger"
                      onClick={() => removeClassFromDay(dayKey, index)}
                    >
                      Remove
                    </CMSButton>
                  </div>
                ))}

                <CMSButton
                  variant="secondary"
                  onClick={() => addClassToDay(dayKey)}
                >
                  + Add Class to {dayLabel}
                </CMSButton>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: cmsLayout.spacing.md }}>
          <label style={cmsLayout.label}>Classes</label>

          {(event.classes || []).map((cls, index) => (
            <div key={index} style={cmsLayout.row}>
              <div style={cmsLayout.column}>
                <CMSSelect
                  label={`Class ${index + 1}`}
                  value={cls}
                  onChange={(value) => {
                    const next = [...(event.classes || [])];
                    next[index] = value;
                    onChange("classes", next);
                  }}
                  options={availableClasses.map((c) => ({
                    label: c.name,
                    value: c.id,
                  }))}
                  placeholder="Select class..."
                />
              </div>

              <CMSButton
                variant="danger"
                onClick={() =>
                  onChange(
                    "classes",
                    (event.classes || []).filter((_, i) => i !== index)
                  )
                }
              >
                Remove
              </CMSButton>
            </div>
          ))}

          <CMSButton
            variant="secondary"
            onClick={() =>
              onChange("classes", [...(event.classes || []), ""])
            }
          >
            + Add Class
          </CMSButton>
        </div>
      )}
    </div>
  );
}
