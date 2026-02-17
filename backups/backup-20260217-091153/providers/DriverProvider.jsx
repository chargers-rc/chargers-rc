// src/app/providers/DriverProvider.jsx
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { supabase } from "@/supabaseClient";
import { useAuth } from "@/app/providers/AuthProvider";
import useMembership from "@/app/hooks/useMembership";

export const DriverContext = createContext({
  drivers: [],
  loadingDrivers: true,
  refreshDrivers: async () => {},
});

export function useDrivers() {
  return useContext(DriverContext);
}

export default function DriverProvider({ children }) {
  const { user, loadingUser } = useAuth();
  const { membership, loadingMembership } = useMembership();

  const [drivers, setDrivers] = useState([]);
  const [loadingDrivers, setLoadingDrivers] = useState(true);

  const loadDrivers = useCallback(async () => {
    if (!membership?.id) {
      setDrivers([]);
      setLoadingDrivers(false);
      return;
    }

    setLoadingDrivers(true);

    try {
      const { data, error } = await supabase
        .from("driver_profiles")
        .select(`
          *,
          drivers!inner(*)
        `)
        .eq("drivers.membership_id", membership.id)
        .order("created_at", { ascending: true });

      if (error) {
        console.warn("DriverProvider loadDrivers error", error);
        setDrivers([]);
      } else {
        setDrivers(data || []);
      }
    } catch (err) {
      console.error("DriverProvider loadDrivers caught", err);
      setDrivers([]);
    } finally {
      setLoadingDrivers(false);
    }
  }, [membership?.id]);

  useEffect(() => {
    if (loadingUser) return;
    if (loadingMembership) return;
    loadDrivers();
  }, [loadingUser, loadingMembership, loadDrivers]);

  return (
    <DriverContext.Provider
      value={{
        drivers,
        loadingDrivers,
        refreshDrivers: loadDrivers,
      }}
    >
      {children}
    </DriverContext.Provider>
  );
}
