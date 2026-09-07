// src/app/routes/ProtectedAppRoute.jsx
import { Navigate, useParams } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";
import { useClub } from "@/app/providers/ClubProvider";
import { useMembership } from "@/app/providers/MembershipProvider";

export default function ProtectedAppRoute({ children }) {
  const { session, loadingUser } = useAuth();
  const { membership, loadingMembership } = useMembership();
  const { club, loadingClub } = useClub();
  const { clubSlug } = useParams();

  // Still loading → block until ready
  if (loadingUser || loadingMembership || loadingClub) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        Checking access…
      </div>
    );
  }

  // 1. Must have a Supabase session
  if (!session?.user) {
    return <Navigate to={`/${clubSlug}/public/login`} replace />;
  }

  // 2. Must have a membership row
  if (!membership) {
    return <Navigate to={`/${clubSlug}/public/login`} replace />;
  }

  // 3. Membership must belong to this club
  if (membership.club_id !== club.id) {
    return <Navigate to={`/${clubSlug}/public/login`} replace />;
  }

  // 4. Membership must be active
  if (membership.status !== "active") {
    return <Navigate to={`/${clubSlug}/public/login`} replace />;
  }

  // All checks passed → allow access
  return children;
}
