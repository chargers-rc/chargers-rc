import CMSButton from "@cms/CMSButton";

export default function EventPreviewModal({ event, onClose }) {
  const isMulti = !!event.is_multi_day;
  const days = Array.isArray(event.days) ? event.days : [];

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 99999,
      }}
    >
      <div
        style={{
          width: "90%",
          maxWidth: "800px",
          background: "#FFF",
          borderRadius: "12px",
          padding: "24px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
          overflowY: "auto",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h2 style={{ margin: 0 }}>Event Preview</h2>
          <CMSButton variant="secondary" onClick={onClose}>
            Close
          </CMSButton>
        </div>

        {/* NAME */}
        <h3 style={{ margin: "8px 0" }}>{event.name || "Untitled Event"}</h3>

        {/* TYPE */}
        {event.event_type && (
          <div style={{ fontSize: "14px", color: "#555" }}>
            Type: {event.event_type}
          </div>
        )}

        {/* TRACK */}
        {event.track && (
          <div style={{ fontSize: "14px", color: "#555" }}>
            Track: {event.track}
          </div>
        )}

        {/* DATES */}
        <div>
          <strong>Event Dates</strong>
          {!isMulti && (
            <div style={{ marginTop: "4px" }}>
              {event.event_date || "No date set"}
            </div>
          )}
          {isMulti && (
            <div
              style={{
                marginTop: "4px",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              {days.length === 0 && <div>No days configured</div>}
              {days.map((d, i) => (
                <div key={i}>{d}</div>
              ))}
            </div>
          )}
        </div>

        {/* DESCRIPTION */}
        {event.description && (
          <div>
            <strong>Description</strong>
            <div style={{ marginTop: "4px" }}>{event.description}</div>
          </div>
        )}

        {/* LOGO */}
        {event.logourl && (
          <div>
            <strong>Logo</strong>
            <div style={{ marginTop: "4px" }}>
              <img
                src={event.logourl}
                alt="Event Logo"
                style={{
                  maxWidth: "200px",
                  height: "auto",
                  borderRadius: "8px",
                  objectFit: "contain",
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
