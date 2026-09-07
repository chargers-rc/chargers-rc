// src/app/providers/ProfileProvider.jsx

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "@/supabaseClient";
import { useAuth } from "@/app/providers/AuthProvider";

const ProfileContext = createContext({
  user: null,
  profile: null,
  loadingProfile: true,
  refreshProfile: async () => {},
});

export function useProfile() {
  return useContext(ProfileContext);
}

export default function ProfileProvider({ children }) {
  const { user, loadingUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const loadProfile = useCallback(async () => {
    // Do NOT run while auth is still hydrating
    if (loadingUser) return;

    // No user → no profile
    if (!user?.id) {
      setProfile(null);
      setLoadingProfile(false);
      return;
    }

    setLoadingProfile(true);

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error("ProfileProvider SELECT error:", error);
      }

      if (data) {
        setProfile({
          ...data,
          email: user.email,
        });
      } else {
        // Create profile if missing
        const meta = user.user_metadata || {};

        const firstName =
          meta.first_name ||
          meta.full_name?.split(" ")?.[0] ||
          "";

        const lastName =
          meta.last_name ||
          meta.full_name?.split(" ")?.slice(1).join(" ") ||
          "";

        const fullName =
          meta.full_name ||
          `${firstName} ${lastName}`.trim();

        const { data: created, error: insertError } = await supabase
          .from("profiles")
          .insert({
            id: user.id,
            email: user.email,
            first_name: firstName,
            last_name: lastName,
            full_name: fullName,
          })
          .select()
          .single();

        if (insertError) {
          console.error("ProfileProvider INSERT error:", insertError);
          setProfile(null);
        } else {
          setProfile({
            ...created,
            email: user.email,
          });
        }
      }
    } catch (err) {
      console.error("ProfileProvider loadProfile exception:", err);
      setProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  }, [user?.id, loadingUser]);

  useEffect(() => {
    if (!loadingUser) {
      loadProfile();
    }
  }, [loadingUser, user?.id, loadProfile]);

  return (
    <ProfileContext.Provider
      value={{
        user,
        profile,
        loadingProfile,
        refreshProfile: loadProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}
