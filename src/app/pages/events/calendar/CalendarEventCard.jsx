import React, { useState } from "react";

export default function CalendarEventCard({
  event,
  brand,
  onNavigate,
  compact = false,
}) {
  const [expanded, setExpanded] = useState(false);
  const hasLogo = event.logourl;

  const formatType = (str) => {
    if (!str) return "";
    return str
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  const isMobile = window.matchMedia("(hover: none)").matches;

  /* ---------------------------
     DESKTOP HOVER BEHAVIOR
     --------------------------- */
  const handleMouseEnter = () => {
    if (!isMobile) setExpanded(true);
  };

  const handleMouseLeave = () => {
    if (!isMobile) setExpanded(false);
  };

  /* ---------------------------
     CLICK BEHAVIOR
     --------------------------- */
  const handleClick = () => {
    if (isMobile) {
      // MOBILE: first tap expands, second tap navigates
      if (!expanded) {
        setExpanded(true);
        return;
      }
      if (onNavigate) onNavigate();
      return;
    }

    // DESKTOP: click navigates immediately
    if (onNavigate) onNavigate();
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={{
        padding: "12px",
        borderRadius: "12px",
        background: "white",
        border: `2px solid ${brand}`,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
        transition: "transform 0.15s ease",
      }}
    >
      {/* TOP ROW */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        {hasLogo ? (
          <img src={event.logourl}
            alt={event.name}
            style={{
              width: "72px",
              height: "72px",
              objectFit: "contain",
              flexShrink: 0,
            }}
          />
        ) : (
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "10px",
              background: brand,
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: "14px",
              textAlign: "center",
              padding: "6px",
              flexShrink: 0,
            }}
          >
            {event.name}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: "14px",
              fontWeight: 700,
              color: "#333",
            }}
          >
            {formatType(event.event_type)}
          </div>

          <div
            style={{
              fontSize: "13px",
              color: "#666",
              marginTop: "2px",
            }}
          >
            {event.track_type || event.track || "Track TBA"}
          </div>
        </div>
      </div>

      {/* EXPANDED DETAILS */}
      {expanded && (
        <div
          style={{
            width: "100%",
            paddingTop: "10px",
            borderTop: "1px solid #eee",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          <div
            style={{
              fontSize: "16px",
              fontWeight: 700,
              color: "#222",
            }}
          >
            {event.name}
          </div>

          <div
            style={{
              fontSize: "13px",
              color: "#555",
            }}
          >
            {event.track_type || event.track || "Track TBA"}
          </div>

          <div
            style={{
              fontSize: "12px",
              color: "#777",
            }}
          >
            {formatType(event.event_type)}
          </div>

          {/* Desktop-only hint */}
          {!isMobile && (
            <div
              style={{
                marginTop: "4px",
                fontSize: "12px",
                fontWeight: 600,
                color: brand,
              }}
            >
              View details →
            </div>
          )}
        </div>
      )}
    </div>
  );
}
