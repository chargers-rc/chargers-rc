// src/app/hooks/useProfile.js
import { useEffect, useState } from "react";
import { supabase } from "@/supabaseClient";

export default function useProfile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [membership, setMembership] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      // Auth user
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        setUser(null);
        setProfile(null);
        setMembership(null);
        setLoading(false);
        return;
      }

      setUser(authUser);

      // Profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single();

      setProfile(profileData || null);

      // Membership
      const { data: membershipData } = await supabase
        .from("memberships")
        .select("*")
        .eq("user_id", authUser.id)
        .single();

      setMembership(membershipData || null);

      setLoading(false);
    };

    load();
  }, []);

  return { user, profile, membership, loading };
}
