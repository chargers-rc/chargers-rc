// src/app/providers/MembershipProvider.jsx
console.log("MembershipProvider: render");

import { createContext, useCallback, useEffect, useState, useContext } from "react";
import { supabase } from "@/supabaseClient";
import { useAuth } from "@/app/providers/AuthProvider";

export const MembershipContext = createContext({
  membership: null,
  loadingMembership: true,

  isNonMember: false,
  isJunior: false,
  isSingle: false,
  isFamily: false,

  renewMembership: async () => {},
  moveToFamilyMembership: async () => {},
  refreshMembership: async () => {},
});

export default function MembershipProvider({ children }) {
  const { user, loadingUser } = useAuth();

  const [membership, setMembership] = useState(null);
  const [loadingMembership, setLoadingMembership] = useState(true);

  const loadMembership = useCallback(async () => {
    if (loadingUser) {
      setLoadingMembership(true);
      return;
    }

    if (!user?.id) {
      setMembership(null);
      setLoadingMembership(false);
      return;
    }

    setLoadingMembership(true);

    try {
      const { data, error } = await supabase
        .from("household_memberships")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        setMembership(null);
      } else {
        const normalised = { ...data };

        normalised.membership_type = (normalised.membership_type || "")
          .toLowerCase()
          .trim();

        normalised.status = (normalised.status || "")
          .toLowerCase()
          .trim();

        if (normalised.end_date) {
          const parsed = new Date(normalised.end_date);
          normalised.endDateObj = Number.isNaN(parsed.getTime())
            ? null
            : parsed;
          normalised.end_date = parsed.toISOString();
        } else {
          normalised.endDateObj = null;
        }

        setMembership(normalised);
      }
    } catch (err) {
      setMembership(null);
    } finally {
      setLoadingMembership(false);
    }
  }, [user?.id, loadingUser]);

  useEffect(() => {
    loadMembership();
  }, [loadMembership]);

  const type = membership?.membership_type;

  const isNonMember = !membership || type === "non_member";
  const isJunior = type === "junior";
  const isSingle = type === "single";
  const isFamily = type === "family";

  return (
    <MembershipContext.Provider
      value={{
        membership,
        loadingMembership,

        isNonMember,
        isJunior,
        isSingle,
        isFamily,

        renewMembership: async () => {},
        moveToFamilyMembership: async () => {},
        refreshMembership: loadMembership,
      }}
    >
      {children}
    </MembershipContext.Provider>
  );
}

/* ⭐ ADD THIS — the missing hook */
export function useMembership() {
  return useContext(MembershipContext);
}
