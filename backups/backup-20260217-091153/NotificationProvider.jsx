import React, { useEffect, useState, useRef, useCallback } from "react";
import NotificationContext from "@app/providers/NotificationContext";
import { supabase } from "@/supabaseClient";

/**
 * NotificationProvider
 * - Uses safe wildcard selects to avoid column-mismatch 400s
 * - Guards against setState after unmount
 * - Debounces realtime refreshes to avoid thundering updates
 * - Exposes a minimal API: { notifications, loadingNotifications, refreshNotifications }
 */

export default function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);

  const mountedRef = useRef(false);
  const lastDataRef = useRef(null);
  const refreshTimerRef = useRef(null);

  const loadNotifications = useCallback(async () => {
    if (!mountedRef.current) return;
    setLoadingNotifications(true);

    try {
      // Use wildcard select to avoid 42703 errors from missing columns
      const result = await supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(100);

      if (result?.error) {
        // eslint-disable-next-line no-console
        console.warn("NotificationProvider loadNotifications error", result.error);
        if (mountedRef.current) {
          setNotifications([]);
          setLoadingNotifications(false);
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
        setNotifications(data);
        lastDataRef.current = data;
      }

      if (mountedRef.current) setLoadingNotifications(false);
      // eslint-disable-next-line no-console
      console.debug("NotificationProvider loadNotifications success", { count: data.length });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("NotificationProvider loadNotifications caught", err);
      if (mountedRef.current) {
        setNotifications([]);
        setLoadingNotifications(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    loadNotifications();

    return () => {
      mountedRef.current = false;
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, [loadNotifications]);

  useEffect(() => {
    // Subscribe to realtime changes and debounce refreshes
    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          // eslint-disable-next-line no-console
          console.debug("NotificationProvider realtime event", {
            event: payload?.eventType ?? payload?.event,
            id: payload?.record?.id,
          });

          if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
          refreshTimerRef.current = setTimeout(() => {
            if (mountedRef.current) loadNotifications();
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
        console.warn("NotificationProvider cleanup error", err);
      }
    };
  }, [loadNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        loadingNotifications,
        refreshNotifications: loadNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
