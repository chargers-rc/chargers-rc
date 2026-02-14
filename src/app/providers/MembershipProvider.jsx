// src/app/providers/MembershipProvider.jsx
import React, { useEffect, useState, useRef, useCallback } from "react";
import MembershipContext from "@app/providers/MembershipContext";
import { supabase } from "@/supabaseClient";

/**
 * MembershipProvider
 * - Uses wildcard select to avoid column-mismatch 400s
 * - Guards against setState after unmount
 * - Debounces realtime refreshes to avoid thundering updates
 * - Exposes a minimal API: { memberships, loadingMemberships, refreshMemberships }
 */

export default function MembershipProvider({ children }) {
  const [memberships, setMemberships] = useState([]);
  const [loadingMemberships, setLoadingMemberships] = useState(true);

  const mountedRef = useRef(false);
  const lastDataRef = useRef(null);
  const refreshTimerRef = useRef(null);

  const loadMemberships = useCallback(async () => {
    if (!mountedRef.current) return;
    setLoadingMemberships(true);

    try {
      // Use wildcard select to avoid 42703 errors from missing columns
      const result = await supabase.from("memberships").select("*");

      if (result?.error) {
        // eslint-disable-next-line no-console
        console.warn("MembershipProvider loadMemberships error", result.error);
        if (mountedRef.current) {
          setMemberships([]);
          setLoadingMemberships(false);
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
        setMemberships(data);
        lastDataRef.current = data;
      }

      if (mountedRef.current) setLoadingMemberships(false);
      // eslint-disable-next-line no-console
      console.debug("MembershipProvider loadMemberships success", { count: data.length });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("MembershipProvider loadMemberships caught", err);
      if (mountedRef.current) {
        setMemberships([]);
        setLoadingMemberships(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    loadMemberships();

    return () => {
      mountedRef.current = false;
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, [loadMemberships]);

  useEffect(() => {
    // Subscribe to realtime changes and debounce refreshes
    const channel = supabase
      .channel("memberships")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "memberships",
        },
        (payload) => {
          // eslint-disable-next-line no-console
          console.debug("MembershipProvider realtime event", {
            event: payload?.eventType ?? payload?.event,
            id: payload?.record?.id,
          });

          if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
          refreshTimerRef.current = setTimeout(() => {
            if (mountedRef.current) loadMemberships();
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
        console.warn("MembershipProvider cleanup error", err);
      }
    };
  }, [loadMemberships]);

  return (
    <MembershipContext.Provider
      value={{
        memberships,
        loadingMemberships,
        refreshMemberships: loadMemberships,
      }}
    >
      {children}
    </MembershipContext.Provider>
  );
}
