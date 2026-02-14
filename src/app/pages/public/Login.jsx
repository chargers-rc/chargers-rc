import { useOutletContext, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/supabaseClient";

export default function Login() {
  const { club } = useOutletContext();
  const navigate = useNavigate();

  // ⭐ Prevent Login from running before club is loaded
  if (!club) {
    return <div className="p-6 text-center">Loading…</div>;
  }

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const clubSlug = club?.slug;

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    const trimmedEmail = email.trim().toLowerCase();

    // ⭐ STEP 1 — Attempt login FIRST (session must exist before RLS will return membership rows)
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    });

    if (loginError) {
      setErrorMsg("Incorrect email or password.");
      setLoading(false);
      return;
    }

    // ⭐ STEP 2 — Now that we have a session, check membership
    const { data: existingMembership, error: lookupError } = await supabase
      .from("household_memberships")
      .select("id")
      .eq("email", trimmedEmail)
      .maybeSingle();

    console.log("LOGIN LOOKUP RESULT", {
      trimmedEmail,
      existingMembership,
      lookupError,
    });

    if (lookupError) {
      setErrorMsg("Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    if (!existingMembership) {
      setErrorMsg("This email is not in the system. Please sign up.");
      setLoading(false);
      return;
    }

    // ⭐ STEP 3 — Success
    navigate(`/${clubSlug}`);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-6">
      <div className="max-w-sm w-full">

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="h-20 w-20 bg-gray-300 rounded-full" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-center mb-6">
          Log in to {club?.name}
        </h1>

        {/* Form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-5">

          {/* Email */}
          <input
            type="email"
            placeholder="Email"
            className="border border-gray-300 rounded-md px-3 py-2 w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* Password */}
          <input
            type="password"
            placeholder="Password"
            className="border border-gray-300 rounded-md px-3 py-2 w-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* Error */}
          {errorMsg && (
            <p className="text-red-600 text-sm text-center">
              {errorMsg}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 bg-black text-white rounded-md font-semibold shadow-sm"
            disabled={loading}
          >
            {loading ? "Logging in…" : "Log In"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-gray-600 mt-6">
          Don’t have an account{" "}
          <Link
            to={`/${clubSlug}/signup`}
            className="text-black underline"
          >
            Sign up
          </Link>
        </p>

      </div>
    </div>
  );
}
