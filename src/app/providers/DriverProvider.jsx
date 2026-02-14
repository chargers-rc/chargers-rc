import React, { useEffect, useState, useRef, useCallback } from "react";
import DriverContext from "@app/providers/DriverContext";
import { supabase } from "@/supabaseClient";

/**
 * DriverProvider (safe wildcard)
 * - Always uses wildcard select to avoid column-mismatch 400s
 * - Mounted guard to avoid setState after unmount
 * - Debounced refresh on realtime events
 * - Minimal public API for consumers
 */

export default function DriverProvider({ children }) {
  const [drivers, setDrivers] = useState([]);
  const [loadingDrivers, setLoadingDrivers] = useState(true);

  const mountedRef = useRef(false);
  const lastDataRef = useRef(null);
  const refreshTimerRef = useRef(null);

  const loadDrivers = useCallback(async () => {
    if (!mountedRef.current) return;
    setLoadingDrivers(true);

    try {
      // Use wildcard select to avoid 42703 errors from missing columns
      const result = await supabase.from("drivers").select("*");

      if (result?.error) {
        // eslint-disable-next-line no-console
        console.warn("DriverProvider loadDrivers error", result.error);
        if (mountedRef.current) {
          setDrivers([]);
          setLoadingDrivers(false);
        }
        return;
      }

      const data = result?.data || [];

      // Avoid setting identical data repeatedly
      const last = lastDataRef.current;
      const changed =
        !last ||
        last.length !== data.length ||
        data.some((r, i) => r.id !== last[i]?.id);

      if (changed && mountedRef.current) {
        setDrivers(data);
        lastDataRef.current = data;
      }

      if (mountedRef.current) setLoadingDrivers(false);
      // eslint-disable-next-line no-console
      console.debug("DriverProvider loadDrivers success", { count: data.length });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("DriverProvider loadDrivers caught", err);
      if (mountedRef.current) {
        setDrivers([]);
        setLoadingDrivers(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    loadDrivers();

    return () => {
      mountedRef.current = false;
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, [loadDrivers]);

  useEffect(() => {
    // Subscribe to realtime changes and debounce refreshes
    const channel = supabase
      .channel("drivers")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "drivers",
        },
        (payload) => {
          // eslint-disable-next-line no-console
          console.debug("DriverProvider realtime event", {
            event: payload?.eventType ?? payload?.event,
            id: payload?.record?.id,
          });

          if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
          refreshTimerRef.current = setTimeout(() => {
            if (mountedRef.current) loadDrivers();
            refreshTimerRef.current = null;
          }, 150);
        }
      )
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(channel);
        channel?.unsubscribe?.();
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn("DriverProvider cleanup error", err);
      }
    };
  }, [loadDrivers]);

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
