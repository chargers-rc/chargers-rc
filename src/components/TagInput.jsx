import { useState } from "react";

export default function TagInput({ values = [], onAdd, onRemove }) {
  const [input, setInput] = useState("");

  const handleAdd = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    if (values.includes(trimmed)) return;

    onAdd(trimmed);
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {values.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-2 bg-gray-200 px-3 py-1 rounded-full text-sm"
          >
            {tag}
            <button
              type="button"
              onClick={() => onRemove(tag)}
              className="text-red-600 font-bold"
            >
              ×
            </button>
          </span>
        ))}
      </div>

      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type and press Enter…"
        className="w-full border rounded px-3 py-2"
      />
    </div>
  );
}
