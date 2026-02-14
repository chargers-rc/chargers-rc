// src/components/GlobalLoadingOverlay.jsx
import useProfile from "../hooks/useProfile";

export default function GlobalLoadingOverlay() {
  const { loading } = useProfile();

  if (!loading) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
