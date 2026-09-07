// src/app/providers/MembershipProvider.jsx

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
import { useClub } from "@/app/providers/ClubProvider";

export const MembershipContext = createContext({
  membership: null,
  loadingMembership: true,
  refreshMembership: async () => {},
});

export function useMembership() {
  return useContext(MembershipContext);
}

export default function MembershipProvider({ children }) {
  const { user, loadingUser } = useAuth();
  const { club } = useClub();

  const [membership, setMembership] = useState(null);
  const [loadingMembership, setLoadingMembership] = useState(true);

  const inFlightRef = useRef(false);

  const loadMembership = useCallback(async () => {
    if (inFlightRef.current) return;

    if (loadingUser || !club?.id) {
      setLoadingMembership(true);
      return;
    }

    if (!user?.id) {
      setMembership(null);
      setLoadingMembership(false);
      return;
    }

    inFlightRef.current = true;
    setLoadingMembership(true);

    try {
      // ⭐ FIXED: removed .eq("status", "active")
      const { data, error } = await supabase
        .from("household_memberships")
        .select("*")
        .eq("user_id", user.id)
        .eq("club_id", club.id)
        .maybeSingle();

      if (error) {
        console.warn("[MembershipProvider] select error", error);
        setMembership(null);
      } else {
        const row = data || null;

        // ⭐ Clean binary membership model
        const isMember =
          row &&
          row.membership_type &&
          row.membership_type !== "non_member";

        setMembership(row ? { ...row, isMember } : null);
      }
    } catch (err) {
      console.error("[MembershipProvider] loadMembership caught", err);
      setMembership(null);
    } finally {
      inFlightRef.current = false;
      setLoadingMembership(false);
    }
  }, [user?.id, loadingUser, club?.id]);

  useEffect(() => {
    if (!loadingUser && user?.id && club?.id) {
      loadMembership();
    }
  }, [loadingUser, user?.id, club?.id, loadMembership]);

  return (
    <MembershipContext.Provider
      value={{
        membership,
        loadingMembership,
        refreshMembership: loadMembership,
      }}
    >
      {children}
    </MembershipContext.Provider>
  );
}
