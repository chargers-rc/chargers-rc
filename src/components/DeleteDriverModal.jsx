import React from "react";

export default function DeleteDriverModal({
  visible,
  hasFutureNominations,
  onConfirm,
  onCancel,
}) {
  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      aria-modal="true"
      role="dialog"
    >
      {/* Dimmed background */}
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>

      {/* Modal box */}
      <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-sm z-10">
        <h2 className="text-xl font-semibold mb-2">Delete Driver</h2>

        {hasFutureNominations ? (
          <p className="text-gray-700 mb-6">
            This driver is nominated for one or more upcoming events. Deleting
            this driver will also remove their future nominations. This action
            cannot be undone.
          </p>
        ) : (
          <p className="text-gray-700 mb-6">
            Are you sure you want to delete this driver?
          </p>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            No, keep driver
          </button>

          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Yes, delete
          </button>
        </div>
      </div>
    </div>
  );
}
