import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";

export default function useDriverSponsors(driverId) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [sponsors, setSponsors] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!driverId) return;

    async function load() {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("driver_profiles")
        .select("*")
        .eq("driver_id", driverId)
        .single();

      if (error) {
        setError(error);
        setLoading(false);
        return;
      }

      setProfile(data);

      // Normalize sponsors
      if (Array.isArray(data?.sponsors)) {
        setSponsors(data.sponsors);
      } else if (typeof data?.sponsors === "string") {
        setSponsors(
          data.sponsors
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        );
      } else {
        setSponsors([]);
      }

      setLoading(false);
    }

    load();
  }, [driverId]);

  return { loading, profile, sponsors, error };
}
