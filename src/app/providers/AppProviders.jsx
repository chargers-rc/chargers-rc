// src/app/providers/AppProviders.jsx

import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";

import ClubProvider from "@/app/providers/ClubProvider";
import ProfileProvider from "@/app/providers/ProfileProvider";
import MembershipProvider from "@/app/providers/MembershipProvider";
import DriverProvider from "@/app/providers/DriverProvider";
import NumberProvider from "@/app/providers/NumberProvider";
import NotificationProvider from "@/app/providers/NotificationProvider";

function AuthenticatedProviders({ children }) {
  return (
    <ClubProvider>
      <ProfileProvider>
        <MembershipProvider>
          <DriverProvider>
            <NumberProvider>
              <NotificationProvider>
                {children}
              </NotificationProvider>
            </NumberProvider>
          </DriverProvider>
        </MembershipProvider>
      </ProfileProvider>
    </ClubProvider>
  );
}

export default function AppProviders() {
  const { user, loadingUser } = useAuth();
  const location = useLocation();

  console.log("[AppProviders]", { user, loadingUser, path: location.pathname });

  // ⭐ 1. Still loading session → show splash
  if (loadingUser) {
    return (
      <div style={{ padding: 40, fontSize: 24 }}>
        Checking session…
      </div>
    );
  }

  // ⭐ 2. User NOT logged in → render login OUTSIDE providers
  if (!user) {
    return <Outlet />;
  }

  // ⭐ 3. User logged in → wrap authenticated routes in providers
  return (
    <AuthenticatedProviders>
      <Outlet />
    </AuthenticatedProviders>
  );
}
