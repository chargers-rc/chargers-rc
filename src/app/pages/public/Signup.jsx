import { useOutletContext, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/supabaseClient";

// Global lock to prevent double submit across remounts
let globalSignupLock = false;

export default function Signup() {
  const { club } = useOutletContext();
  const navigate = useNavigate();

  // ⭐ Prevent Signup from running before club is loaded
  if (!club) {
    return <div className="p-6 text-center">Loading…</div>;
  }

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const clubSlug = club?.slug;

  const isValidEmail = (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSignup = async (e) => {
    e.preventDefault();

    if (globalSignupLock) return;
    globalSignupLock = true;

    setLoading(true);
    setErrorMsg("");

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    if (!trimmedName) {
      setErrorMsg("Please enter your full name.");
      setLoading(false);
      globalSignupLock = false;
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setErrorMsg("Please enter a valid email address.");
      setLoading(false);
      globalSignupLock = false;
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      setLoading(false);
      globalSignupLock = false;
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      setLoading(false);
      globalSignupLock = false;
      return;
    }

    // 1. Create Supabase auth user
    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
      globalSignupLock = false;
      return;
    }

    const user = data?.user;
    if (!user) {
      setErrorMsg("Signup failed. Please try again.");
      setLoading(false);
      globalSignupLock = false;
      return;
    }

    // 2. Upsert profile
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert(
        {
          id: user.id,
          full_name: trimmedName,
          role: "user",
          membership_id: null,
          phone: null,
          manufacturer: null,
          manufacturer_logo: null,
          sponsors: null,
          transponder_number: null,
        },
        { onConflict: "id" }
      );

    if (profileError) {
      setErrorMsg(profileError.message);
      setLoading(false);
      globalSignupLock = false;
      return;
    }

    // Split name for household_memberships
    const nameParts = trimmedName.split(" ");
    const primary_first_name = nameParts[0] || null;
    const primary_last_name =
      nameParts.length > 1 ? nameParts.slice(1).join(" ") : null;

    // 3. Check for existing household membership by email
    const { data: existingMembership, error: lookupError } = await supabase
      .from("household_memberships")
      .select("*")
      .eq("email", trimmedEmail)
      .maybeSingle();

    if (lookupError) {
      setErrorMsg("Error checking membership records.");
      setLoading(false);
      globalSignupLock = false;
      return;
    }

    // 4. If membership exists → attach user WITHOUT overwriting membership_type
    if (existingMembership) {
      const { error: attachError } = await supabase
        .from("household_memberships")
        .update({
          user_id: user.id,
          status: "active",
          primary_first_name,
          primary_last_name,
        })
        .eq("id", existingMembership.id);

      if (attachError) {
        setErrorMsg("Failed to attach user to existing membership.");
        setLoading(false);
        globalSignupLock = false;
        return;
      }

      setLoading(false);
      globalSignupLock = false;
      navigate(`/${clubSlug}/welcome`);
      return;
    }

    // 5. No existing membership → create NON-MEMBER membership
    const { error: createMembershipError } = await supabase
      .from("household_memberships")
      .insert({
        user_id: user.id,
        email: trimmedEmail,
        membership_type: "non_member",
        status: "active",
        primary_first_name,
        primary_last_name,
        created_at: new Date().toISOString(),
      });

    if (createMembershipError) {
      setErrorMsg("Failed to create membership record.");
      setLoading(false);
      globalSignupLock = false;
      return;
    }

    setLoading(false);
    globalSignupLock = false;
    navigate(`/${clubSlug}/welcome`);
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
          Create your account
        </h1>

        {/* Form */}
        <form onSubmit={handleSignup} className="flex flex-col gap-5">

          {/* Full Name */}
          <input
            type="text"
            placeholder="Full name"
            className="border border-gray-300 rounded-md px-3 py-2 w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          {/* Email */}
          <div className="flex flex-col gap-1">
            <input
              type="email"
              placeholder="Email"
              className="border border-gray-300 rounded-md px-3 py-2 w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div className="relative flex flex-col gap-1">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="border border-gray-300 rounded-md px-3 py-2 w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2 text-sm text-gray-600"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative flex flex-col gap-1">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm password"
              className="border border-gray-300 rounded-md px-3 py-2 w-full"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
              className="absolute right-3 top-2 text-sm text-gray-600"
            >
              {showConfirmPassword ? "Hide" : "Show"}
            </button>
          </div>

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
            {loading ? "Creating account…" : "Sign Up"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-gray-600 mt-6">
          Already have an account{" "}
          <Link
            to={`/${clubSlug}/login`}
            className="text-black underline"
          >
            Log in
          </Link>
        </p>

      </div>
    </div>
  );
}
