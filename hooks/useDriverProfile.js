import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";

export default function useDriverProfile(driverId) {
  const [loading, setLoading] = useState(true);
  const [driver, setDriver] = useState(null);
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
      } else {
        setDriver(data);
      }

      setLoading(false);
    }

    load();
  }, [driverId]);

  return { loading, driver, error };
}
