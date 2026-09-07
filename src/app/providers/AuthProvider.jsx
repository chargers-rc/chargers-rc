// src/app/providers/AuthProvider.jsx
import { createContext, useContext, useEffect, useState, useRef } from "react";
import { supabase } from "@/supabaseClient";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [membership, setMembership] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [signupEmail, setSignupEmail] = useState("");

  const hydratingRef = useRef(false);

  // ------------------------------------------------------------
  // Hydrate user fully before allowing CMS to render
  // ------------------------------------------------------------
  async function hydrateUser(newSession) {
    if (!newSession?.user || !newSession.user.id) {
      hydratingRef.current = false;
      setProfile(null);
      setMembership(null);
      return;
    }

    hydratingRef.current = true;

    const userId = newSession.user.id;
    const email = newSession.user.email?.toLowerCase();
    const meta = newSession.user.user_metadata || {};

    // Load profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (!hydratingRef.current) return;
    setProfile(profileData || null);

    const clubId =
      meta.club_id ||
      profileData?.club_id ||
      null;

    // Load membership by user_id
    let { data: membershipData } = await supabase
      .from("household_memberships")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (!hydratingRef.current) return;

    // Claim-by-email if needed
    if (!membershipData && clubId && email) {
      const { data: byEmail } = await supabase
        .from("household_memberships")
        .select("*")
        .eq("club_id", clubId)
        .ilike("email", email)
        .is("user_id", null)
        .maybeSingle();

      if (byEmail) {
        const { data: claimed } = await supabase
          .from("household_memberships")
          .update({ user_id: userId })
          .eq("id", byEmail.id)
          .select()
          .maybeSingle();

        membershipData = claimed || byEmail;
      }
    }

    if (!hydratingRef.current) return;

    // Create non-member if still missing
    if (!membershipData && clubId) {
      const { data: inserted } = await supabase
        .from("household_memberships")
        .insert({
          user_id: userId,
          email: email,
          primary_first_name: meta.first_name || profileData?.first_name,
          primary_last_name: meta.last_name || profileData?.last_name,
          membership_type: "non_member",
          club_id: clubId,
        })
        .select()
        .maybeSingle();

      membershipData = inserted;
    }

    if (!hydratingRef.current) return;

    setMembership(membershipData || null);

    hydratingRef.current = false;
  }

  // ------------------------------------------------------------
  // Handle session changes
  // ------------------------------------------------------------
  async function handleSession(newSession) {
    setSession(newSession);

    if (!newSession?.user) {
      hydratingRef.current = false;
      setProfile(null);
      setMembership(null);
      return;
    }

    await hydrateUser(newSession);
  }

  // ------------------------------------------------------------
  // Mount: ONE getSession call + listener
  // ------------------------------------------------------------
  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const initialSession = sessionData?.session ?? null;

        if (!mounted) return;

        await handleSession(initialSession);
      } catch (err) {
        console.error(">>> AuthProvider init error", err);
      } finally {
        if (mounted) {
          // ⭐ Only finish loading AFTER hydration completes
          setLoadingUser(false);
        }
      }
    }

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;

        if (event === "PASSWORD_RECOVERY") return;

        if (event === "SIGNED_OUT") {
          hydratingRef.current = false;
          setSession(null);
          setProfile(null);
          setMembership(null);
          setLoadingUser(false);
          return;
        }

        await handleSession(newSession);

        // ⭐ Only finish loading AFTER hydration completes
        setLoadingUser(false);
      }
    );

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe?.();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        profile,
        membership,
        loadingUser,
        signupEmail,
        setSignupEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
