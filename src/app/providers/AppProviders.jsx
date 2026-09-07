// src/app/providers/AppProviders.jsx

import { Outlet } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";

import ClubProvider from "@/app/providers/ClubProvider";
import ProfileProvider from "@/app/providers/ProfileProvider";
import MembershipProvider from "@/app/providers/MembershipProvider";
import DriverProvider from "@/app/providers/DriverProvider";
import NumberProvider from "@/app/providers/NumberProvider";
import NotificationProvider from "@/app/providers/NotificationProvider";

function InnerAppProviders({ children }) {
  const { user, loadingUser } = useAuth();

  console.log("[InnerAppProviders]", { user, loadingUser });

  // Allow rendering while loadingUser === true
  if (loadingUser) {
    return <div style={{ padding: 40, fontSize: 24 }}>Loading user…</div>;
  }

  // ⭐ ALWAYS mount ClubProvider — public routes REQUIRE club
  return (
    <ClubProvider>
      {/* Profile + membership only when user exists */}
      {user ? (
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
      ) : (
        children
      )}
    </ClubProvider>
  );
}

export default function AppProviders() {
  return (
    <InnerAppProviders>
      <Outlet />
    </InnerAppProviders>
  );
}
