// src/components/SponsorTagInput.jsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import PropTypes from "prop-types";

/**
 * SponsorTagInput
 *
 * Props:
 * - value: array of sponsor strings (controlled-ish)
 * - onChange: function(newArray) called only when user adds/removes tags
 *
 * Behavior:
 * - Initializes internal tags state from `value` only when `value` actually changes.
 * - Does NOT call onChange on mount.
 * - Calls onChange only in response to explicit user actions (add/remove).
 * - Handlers are memoized with useCallback to keep stable identity.
 */

export default function SponsorTagInput({ value = [], onChange }) {
  // local state for tags
  const [tags, setTags] = useState(Array.isArray(value) ? value.slice() : []);

  // refs to avoid calling onChange on mount and to track last incoming value
  const initializedForRef = useRef(null);
  const isMountRef = useRef(true);

  // shallow compare helper
  const arraysEqualShallow = (a = [], b = []) => {
    if (a === b) return true;
    if (!Array.isArray(a) || !Array.isArray(b)) return false;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  };

  // Initialize local state only when incoming `value` changes (by shallow compare)
  useEffect(() => {
    // on first mount, set tags from value but don't call onChange
    if (initializedForRef.current === null) {
      initializedForRef.current = value ? value.slice() : [];
      setTags(initializedForRef.current.slice());
      isMountRef.current = false;
      return;
    }

    // if incoming value differs from what we last initialized for, update local state
    if (!arraysEqualShallow(initializedForRef.current, value)) {
      initializedForRef.current = value ? value.slice() : [];
      setTags(initializedForRef.current.slice());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Add tag (user action)
  const addTag = useCallback(
    (tag) => {
      if (!tag || typeof tag !== "string") return;
      const trimmed = tag.trim();
      if (!trimmed) return;
      // avoid duplicates
      if (tags.includes(trimmed)) return;
      const next = [...tags, trimmed];
      setTags(next);
      if (typeof onChange === "function") onChange(next);
    },
    [tags, onChange]
  );

  // Remove tag (user action)
  const removeTag = useCallback(
    (tagToRemove) => {
      const next = tags.filter((t) => t !== tagToRemove);
      setTags(next);
      if (typeof onChange === "function") onChange(next);
    },
    [tags, onChange]
  );

  // Simple input handler for adding tags via Enter or comma
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        const input = e.target;
        const val = input.value;
        if (val && val.trim()) {
          addTag(val);
          input.value = "";
        }
      } else if (e.key === "Backspace" && !e.target.value) {
        // optional: remove last tag on backspace when input empty
        if (tags.length > 0) {
          removeTag(tags[tags.length - 1]);
        }
      }
    },
    [addTag, removeTag, tags]
  );

  // Render
  return (
    <div className="sponsor-tag-input">
      <div className="tags flex flex-wrap gap-2 mb-2">
        {tags.map((t) => (
          <span
            key={t}
            className="inline-flex items-center gap-2 px-2 py-1 bg-gray-100 rounded text-sm"
            style={{ userSelect: "none" }}
          >
            <span>{t}</span>
            <button
              type="button"
              aria-label={`Remove ${t}`}
              onClick={() => removeTag(t)}
              className="text-xs text-red-600 hover:underline"
            >
              ×
            </button>
          </span>
        ))}
      </div>

      <input
        type="text"
        className="border rounded px-2 py-1 w-full"
        placeholder="Add sponsor and press Enter"
        onKeyDown={handleKeyDown}
        aria-label="Add sponsor"
      />
    </div>
  );
}

SponsorTagInput.propTypes = {
  value: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func,
};
