// src/app/providers/ProfileProvider.jsx
import { useEffect, useState } from "react";
import ProfileContext from "@app/providers/ProfileContext";
import { supabase } from "@/supabaseClient";

export default function ProfileProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [membership, setMembership] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setLoading(true);

        // Auth user
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (!isMounted) return;

        if (!authUser) {
          setUser(null);
          setProfile(null);
          setMembership(null);
          return;
        }

        setUser(authUser);

        // Profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authUser.id)
          .single();

        if (!isMounted) return;
        if (profileError) {
          console.warn("ProfileProvider profile fetch error", profileError);
          setProfile(null);
        } else {
          setProfile(profileData || null);
        }

        // Membership
        const { data: membershipData, error: membershipError } = await supabase
          .from("household_memberships")
          .select("*")
          .eq("user_id", authUser.id)
          .maybeSingle();

        if (!isMounted) return;
        if (membershipError) {
          console.warn("ProfileProvider membership fetch error", membershipError);
          setMembership(null);
        } else {
          setMembership(membershipData || null);
        }
      } catch (err) {
        console.error("ProfileProvider load error", err);
        if (!isMounted) return;
        setUser(null);
        setProfile(null);
        setMembership(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <ProfileContext.Provider
      value={{
        user,
        profile,
        membership,
        loading,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}
