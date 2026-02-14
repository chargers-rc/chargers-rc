import React, { useEffect, useState } from "react";
import ClubContext from "@app/providers/ClubContext";

/**
 * ClubProvider
 * Provides a default club context so routes that rely on a club slug
 * have a sensible default while the app fetches real data.
 *
 * NOTE: This default uses the canonical slug "chargersrc".
 * If your production DB contains a different canonical slug, update here.
 */
export default function ClubProvider({ children }) {
  const [club, setClub] = useState(null);
  const [loadingClub, setLoadingClub] = useState(true);

  useEffect(() => {
    // Default club used only as an initial context while the app fetches.
    const defaultClub = {
      // id must be a UUID string if other code expects UUIDs.
      // Use a stable UUID here for local dev; production rows should come from the DB.
      id: "00000000-0000-4000-8000-000000000001",
      name: "Chargers RC",
      slug: "chargersrc",
      logo_url: "/assets/Chargers_RC_Logo_2026.png",
      theme: {
        textColor: "#ffffff",
        background: "#0f172a",
        headerBackground: "#0f172a",
        headerTextColor: "#ffffff",
        cardBackground: "#1e293b",
        cardTextColor: "#ffffff",
        colors: {
          primary: "#1E40AF",
          accent: "#FACC15",
        },
        styleVariant: "sport",
      },
      settings: {},
    };

    // Provide the default immediately; real ClubLayout will replace it if DB returns a club.
    setClub(defaultClub);
    setLoadingClub(false);
  }, []);

  return (
    <ClubContext.Provider value={{ club, loadingClub, setClub }}>
      {children}
    </ClubContext.Provider>
  );
}
