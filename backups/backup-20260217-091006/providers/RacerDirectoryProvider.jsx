import { useEffect, useState, useCallback, useRef } from "react";
import RacerDirectoryContext from "@app/providers/RacerDirectoryContext";
import { supabase } from "@/supabaseClient";

/**
 * RacerDirectoryProvider (safe wildcard)
 * - Always uses wildcard select to avoid column-mismatch 400s
 * - Mounted guard and debounced realtime refresh
 * - Minimal public API
 */

export default function RacerDirectoryProvider({ children }) {
  const [racers, setRacers] = useState([]);
  const [loadingRacers, setLoadingRacers] = useState(true);
  const mountedRef = useRef(false);
  const lastDataRef = useRef(null);
  const refreshTimerRef = useRef(null);

  const loadRacers = useCallback(async () => {
    if (!mountedRef.current) return;
    setLoadingRacers(true);

    try {
      // Use wildcard select to avoid 42703 errors from missing columns
      const result = await supabase.from("driver_profiles").select("*").eq("is_public", true);

      if (result?.error) {
        // eslint-disable-next-line no-console
        console.warn("RacerDirectoryProvider loadRacers error", result.error);
        if (mountedRef.current) {
          setRacers([]);
          setLoadingRacers(false);
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
        setRacers(data);
        lastDataRef.current = data;
      }

      if (mountedRef.current) setLoadingRacers(false);
      // eslint-disable-next-line no-console
      console.debug("RacerDirectoryProvider loadRacers success", { count: data.length });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("RacerDirectoryProvider loadRacers caught", err);
      if (mountedRef.current) {
        setRacers([]);
        setLoadingRacers(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    loadRacers();

    return () => {
      mountedRef.current = false;
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, [loadRacers]);

  useEffect(() => {
    const channel = supabase
      .channel("racer-directory")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "driver_profiles",
        },
        (payload) => {
          // eslint-disable-next-line no-console
          console.debug("RacerDirectoryProvider realtime event", {
            event: payload?.eventType ?? payload?.event,
            id: payload?.record?.id,
          });

          if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
          refreshTimerRef.current = setTimeout(() => {
            if (mountedRef.current) loadRacers();
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
        console.warn("RacerDirectoryProvider cleanup error", err);
      }
    };
  }, [loadRacers]);

  return (
    <RacerDirectoryContext.Provider
      value={{
        racers,
        loadingRacers,
        refreshRacers: loadRacers,
      }}
    >
      {children}
    </RacerDirectoryContext.Provider>
  );
}
