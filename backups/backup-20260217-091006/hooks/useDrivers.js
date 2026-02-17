// src/app/hooks/useDrivers.js
import { useEffect, useState } from "react";
import { supabase } from "@/supabaseClient";

export default function useDrivers(membershipId) {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!membershipId) {
      setDrivers([]);
      setLoading(false);
      return;
    }

    const loadDrivers = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("drivers")
        .select(`
          id,
          membership_id,
          first_name,
          last_name,
          driver_type,
          is_junior,
          email,
          created_at,
          driver_profiles (
            avatar_url,
            nickname,
            country_code,
            team_name,
            sponsors,
            chassis,
            favorite_rc_car,
            about,
            transponders,
            preferred_classes,
            home_track,
            social_instagram,
            social_youtube,
            social_facebook,
            social_tiktok,
            social_website,
            visible_in_directory,
            is_public
          )
        `)
        .eq("membership_id", membershipId)
        .order("created_at", { ascending: true });

      if (error) {
        setError(error);
        setLoading(false);
        return;
      }

      const flattened = (data ?? []).map((d) => {
        const profile = d.driver_profiles || {};

        return {
          id: d.id,
          membership_id: d.membership_id,
          first_name: d.first_name,
          last_name: d.last_name,
          driver_type: d.driver_type,
          is_junior: d.is_junior,
          email: d.email,
          created_at: d.created_at,
          avatar_url: profile.avatar_url || null,
          nickname: profile.nickname || null,
          country_code: profile.country_code || null,
          team_name: profile.team_name || null,
          sponsors: profile.sponsors || [],
          chassis: profile.chassis || null,
          favorite_rc_car: profile.favorite_rc_car || null,
          about: profile.about || null,
          transponders: profile.transponders || [],
          preferred_classes: profile.preferred_classes || [],
          home_track: profile.home_track || null,
          social_instagram: profile.social_instagram || null,
          social_youtube: profile.social_youtube || null,
          social_facebook: profile.social_facebook || null,
          social_tiktok: profile.social_tiktok || null,
          social_website: profile.social_website || null,
          visible_in_directory: profile.visible_in_directory ?? false,
          is_public: profile.is_public ?? true,
        };
      });

      setDrivers(flattened);
      setLoading(false);
    };

    loadDrivers();
  }, [membershipId]);

  return { drivers, loading, error };
}
