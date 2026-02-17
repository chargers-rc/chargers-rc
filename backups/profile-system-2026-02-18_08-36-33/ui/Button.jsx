export default function Button({
  children,
  onClick,
  variant = "primary",
  className = "",
  type = "button",
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`px-md py-sm rounded-md font-semibold bg-red-600 text-white ${className}`}
    >
      {children}
    </button>
  );
}
