// src/app/providers/DriverProvider.jsx
console.log("DriverProvider: render");

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
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

  const inFlightRef = useRef(false);
  const watchdogRef = useRef(null);

  const clearWatchdog = () => {
    if (watchdogRef.current) {
      clearTimeout(watchdogRef.current);
      watchdogRef.current = null;
    }
  };

  const loadDrivers = useCallback(async () => {
    console.debug("[DriverProvider] loadDrivers called");

    if (inFlightRef.current) {
      console.debug("[DriverProvider] loadDrivers skipped — already in flight");
      return;
    }

    if (typeof loadingUser !== "boolean" || typeof loadingMembership !== "boolean") {
      console.debug("[DriverProvider] loadDrivers deferred — loading flags not yet boolean", { loadingUser, loadingMembership });
      return;
    }

    if (loadingUser === true || loadingMembership === true) {
      console.debug("[DriverProvider] loadDrivers deferred — auth/membership still loading", { loadingUser, loadingMembership });
      return;
    }

    inFlightRef.current = true;
    clearWatchdog();
    watchdogRef.current = setTimeout(() => {
      console.warn("[DriverProvider] watchdog: clearing inFlightRef after timeout");
      inFlightRef.current = false;
      watchdogRef.current = null;
    }, 30000);

    console.debug("[DriverProvider] loadDrivers start", {
      userId: user?.id,
      membershipId: membership?.id,
      loadingUser,
      loadingMembership,
    });

    if (!membership?.id) {
      console.debug("[DriverProvider] no membership.id — clearing drivers");
      setDrivers([]);
      setLoadingDrivers(false);
      inFlightRef.current = false;
      clearWatchdog();
      return;
    }

    setLoadingDrivers(true);

    try {
      const { data, error, status } = await supabase
        .from("drivers")
        .select("*, driver_profiles(*)")
        .eq("membership_id", membership.id)
        .order("created_at", { ascending: true });

      console.debug("[DriverProvider] supabase response", {
        status,
        error,
        rows: Array.isArray(data) ? data.length : (data ? 1 : 0),
      });

      if (error) {
        console.warn("[DriverProvider] supabase returned error", error);
        setDrivers([]);
      } else {
        const normalized = (data || []).map((driverRow) => {
          const profile = Array.isArray(driverRow.driver_profiles)
            ? driverRow.driver_profiles[0] || null
            : driverRow.driver_profiles || null;

          const { driver_profiles: _ignore, ...driverFields } = driverRow;

          return {
            ...driverFields,
            profile,
          };
        });

        setDrivers(normalized);
        console.debug("[DriverProvider] drivers state", normalized);
      }
    } catch (err) {
      console.error("[DriverProvider] loadDrivers caught", err);
      setDrivers([]);
    } finally {
      setLoadingDrivers(false);
      inFlightRef.current = false;
      clearWatchdog();
      console.debug("[DriverProvider] loadDrivers finished", { loadingDrivers: false });
    }
  }, [membership?.id, user?.id]); // FIXED: removed loadingUser/loadingMembership

  useEffect(() => {
    if (typeof loadingUser !== "boolean" || typeof loadingMembership !== "boolean") {
      console.debug("[DriverProvider] waiting for loading flags to become boolean", { loadingUser, loadingMembership });
      return;
    }

    if (loadingUser === true || loadingMembership === true) {
      console.debug("[DriverProvider] waiting for loadingUser/loadingMembership to finish", { loadingUser, loadingMembership });
      return;
    }

    if (!membership?.id) {
      console.debug("[DriverProvider] no membership.id — clearing drivers (useEffect)");
      setDrivers([]);
      setLoadingDrivers(false);
      return;
    }

    (async () => {
      try {
        await loadDrivers();
      } catch (err) {
        console.error("[DriverProvider] loadDrivers invocation error", err);
      }
    })();
  }, [membership?.id, loadingUser, loadingMembership]); // FIXED: removed loadDrivers

  return (
    <DriverContext.Provider value={{ drivers, loadingDrivers, refreshDrivers: loadDrivers }}>
      {children}
    </DriverContext.Provider>
  );
}
