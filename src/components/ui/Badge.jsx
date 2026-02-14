export default function Modal({ open, onClose, title, children }) {
  if (!open) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal animate-slideUp">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
          >
            ✕
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
