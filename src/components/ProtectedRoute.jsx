// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return null;

  // Not logged in → go to club login
  if (!session) return <Navigate to="../login" replace />;

  // Admin check
  if (adminOnly) {
    const isAdmin = session?.user?.email?.endsWith("@chargersrc.com");
    if (!isAdmin) return <Navigate to="../dashboard" replace />;
  }

  return children;
}
