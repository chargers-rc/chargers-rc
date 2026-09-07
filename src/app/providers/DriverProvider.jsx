// src/app/providers/DriverProvider.jsx
console.log("DriverProvider: render");

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { supabase } from "@/supabaseClient";
import { useAuth } from "@/app/providers/AuthProvider";
import { useMembership } from "@/app/providers/MembershipProvider";

export const DriverContext = createContext({
  drivers: [],
  loadingDrivers: true,
  refreshDrivers: async () => {},
  deleteDriver: async () => {},
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

  const loadDrivers = useCallback(async () => {
    if (inFlightRef.current) return;
    if (loadingUser || loadingMembership) return;

    // ⭐ FIX: membership may be null on first render
    if (!user?.id || !membership) {
      setDrivers([]);
      setLoadingDrivers(false);
      return;
    }

    const membershipId = membership.id;
    const membershipType = membership.membership_type;
    const clubId = membership.club_id;

    if (!clubId) {
      console.warn("[DriverProvider] membership missing club_id");
      setDrivers([]);
      setLoadingDrivers(false);
      return;
    }

    inFlightRef.current = true;
    setLoadingDrivers(true);

    try {
      let response;

      if (membershipType === "global_admin") {
        response = await supabase
          .from("drivers")
          .select("*")
          .eq("club_id", clubId)
          .order("created_at", { ascending: true });
      } else if (membershipType === "non_member") {
        response = await supabase
          .from("drivers")
          .select("*")
          .eq("club_id", clubId)
          .is("membership_id", null)
          .eq("created_by", user.id)
          .order("created_at", { ascending: true });
      } else {
        response = await supabase
          .from("drivers")
          .select("*")
          .eq("membership_id", membershipId)
          .order("created_at", { ascending: true });
      }

      if (response.error) {
        console.warn("[DriverProvider] supabase error", response.error);
        setDrivers([]);
      } else {
        setDrivers(response.data || []);
      }
    } catch (err) {
      console.error("[DriverProvider] loadDrivers caught", err);
      setDrivers([]);
    } finally {
      inFlightRef.current = false;
      setLoadingDrivers(false);
    }
  }, [
    user?.id,
    loadingUser,
    loadingMembership,
    membership?.id,
    membership?.membership_type,
    membership?.club_id,
  ]);

  const deleteDriver = useCallback(
    async (driverId) => {
      if (!driverId) return;

      const { error: driverError } = await supabase
        .from("drivers")
        .delete()
        .eq("id", driverId);

      if (driverError) {
        console.error("[DriverProvider] delete driver error", driverError);
        throw driverError;
      }

      const { error: memberError } = await supabase
        .from("club_members")
        .update({ driver_id: null })
        .eq("driver_id", driverId);

      if (memberError) {
        console.warn(
          "[DriverProvider] convert club_member to member-only error",
          memberError
        );
      }

      await loadDrivers();
    },
    [loadDrivers]
  );

  useEffect(() => {
    if (!loadingUser && !loadingMembership && membership) {
      loadDrivers();
    }
  }, [
    loadingUser,
    loadingMembership,
    membership?.id,
    membership?.membership_type,
    membership?.club_id,
    loadDrivers,
  ]);

  useEffect(() => {
    if (loadingUser || loadingMembership || !membership) return;

    const membershipId = membership.id;
    const membershipType = membership.membership_type;
    const clubId = membership.club_id;

    if (!clubId) return;

    let channel;

    if (membershipType === "global_admin") {
      channel = supabase
        .channel("drivers-global-admin")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "drivers",
            filter: `club_id=eq.${clubId}`,
          },
          () => loadDrivers()
        )
        .subscribe();
    } else if (membershipType === "non_member") {
      channel = supabase
        .channel("drivers-nonmember")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "drivers",
            filter: `created_by=eq.${user.id}`,
          },
          () => loadDrivers()
        )
        .subscribe();
    } else {
      channel = supabase
        .channel("drivers-member")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "drivers",
            filter: `membership_id=eq.${membershipId}`,
          },
          () => loadDrivers()
        )
        .subscribe();
    }

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [
    loadingUser,
    loadingMembership,
    membership?.id,
    membership?.membership_type,
    membership?.club_id,
    user?.id,
    loadDrivers,
  ]);

  return (
    <DriverContext.Provider
      value={{
        drivers,
        loadingDrivers,
        refreshDrivers: loadDrivers,
        deleteDriver,
      }}
    >
      {children}
    </DriverContext.Provider>
  );
}
