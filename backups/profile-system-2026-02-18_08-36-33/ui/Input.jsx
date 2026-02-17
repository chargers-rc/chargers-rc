// src/components/ui/Input.jsx
import React from "react";

export default function Input({
  label,
  type = "text",
  value,
  onChange,
  required = false,
  className = "",
  ...props
}) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className={
          "border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary " +
          className
        }
        {...props}
      />
    </div>
  );
}
