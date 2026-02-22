// src/app/providers/ClubLayout.jsx
console.log("ClubLayout: start render");

import { useEffect, useState } from "react";
import { Outlet, useParams } from "react-router-dom";
import { supabase } from "@/supabaseClient";

import MembershipProvider from "@/app/providers/MembershipProvider";
import ProfileProvider from "@/app/providers/ProfileProvider";
import DriverProvider from "@/app/providers/DriverProvider";
import NumberProvider from "./NumberProvider";

import Header from "@/components/ui/Header";

export default function ClubLayout() {
  const { clubSlug } = useParams();

  const [loadingClub, setLoadingClub] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [club, setClub] = useState(null);

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // LOAD CLUB
  useEffect(() => {
    let mounted = true;

    const loadClub = async () => {
      setLoadingClub(true);
      setNotFound(false);

      const { data, error } = await supabase
        .from("clubs")
        .select("id, name, slug, logo_url")
        .eq("slug", clubSlug)
        .single();

      if (!mounted) return;

      if (error || !data) {
        setNotFound(true);
        setLoadingClub(false);
        return;
      }

      if (data && typeof data.logo_url === "string") {
        const badHosts = ["your-bucket-url", "example.com", "localhost-placeholder"];
        try {
          const u = new URL(data.logo_url);
          if (badHosts.some((h) => u.hostname.includes(h))) {
            data.logo_url = null;
          }
        } catch {
          data.logo_url = null;
        }
      }

      setClub(data);
      setLoadingClub(false);
    };

    loadClub();

    return () => {
      mounted = false;
    };
  }, [clubSlug]);

  // LOAD USER
  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      setLoadingUser(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) return;

      setUser(user || null);
      setLoadingUser(false);
    };

    loadUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (loadingClub || loadingUser) {
    return <div className="p-6 text-center">Loading user & club…</div>;
  }

  if (notFound) {
    return <div className="p-6 text-center">Club not found</div>;
  }

  return (
    <div className="min-h-screen w-full bg-[var(--background)] text-[var(--text)]">
      <MembershipProvider user={user} club={club}>
        <ProfileProvider user={user}>
          <DriverProvider>
            <NumberProvider>
              <Header club={club} user={user} />
              <Outlet context={{ club, user }} />
            </NumberProvider>
          </DriverProvider>
        </ProfileProvider>
      </MembershipProvider>
    </div>
  );
}
