import React, { useEffect, useState, useContext } from "react";
import { Outlet, useParams, useLocation } from "react-router-dom";
import { supabase } from "@/supabaseClient";
import ClubContext from "@app/providers/ClubContext";

const DEFAULT_THEME = {
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
};

export default function ClubLayout() {
  const { clubSlug } = useParams();
  const location = useLocation();
  const clubContext = useContext(ClubContext);

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [club, setClub] = useState(clubContext?.club ?? null);

  useEffect(() => {
    let mounted = true;

    const contextClub = clubContext?.club;
    if (contextClub && (!clubSlug || contextClub.slug === clubSlug)) {
      if (!club || club.id !== contextClub.id) {
        setClub(contextClub);
      }
      setLoading(false);
      setNotFound(false);
      return () => {
        mounted = false;
      };
    }

    if (!clubSlug) {
      setNotFound(true);
      setLoading(false);
      return () => {
        mounted = false;
      };
    }

    const loadClub = async () => {
      try {
        setLoading(true);
        setNotFound(false);

        const { data, error } = await supabase
          .from("clubs")
          .select("id, name, slug, logo_url")
          .eq("slug", clubSlug)
          .single();

        if (!mounted) return;

        if (error || !data) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        const clubWithTheme = {
          ...data,
          theme: data.theme ?? DEFAULT_THEME,
        };

        if (!club || club.id !== clubWithTheme.id) {
          setClub(clubWithTheme);
        }
        setLoading(false);
      } catch (err) {
        if (!mounted) return;
        setNotFound(true);
        setLoading(false);
      }
    };

    loadClub();

    return () => {
      mounted = false;
    };
  }, [clubSlug]);

  if (loading) return <div>Loading club…</div>;
  if (notFound) {
    return (
      <div style={{ padding: 24 }}>
        <h2>Club not found</h2>
        <p>The app could not find a club for the current URL.</p>
        <p style={{ color: "#666", fontSize: 13 }}>
          <strong>Route slug:</strong> {clubSlug ?? "<none>"}<br />
          <strong>Try:</strong> /chargersrc or ensure ClubProvider supplies a default club.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Outlet context={{ club }} />
    </div>
  );
}
