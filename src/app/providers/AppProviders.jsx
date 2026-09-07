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

  return (
    <ClubProvider>
      <ProfileProvider>
        <MembershipProvider>
          <DriverProvider>
            <NumberProvider>
              <NotificationProvider>
                {loadingUser ? (
                  <div style={{ padding: 40, fontSize: 24 }}>
                    Loading user…
                  </div>
                ) : (
                  children
                )}
              </NotificationProvider>
            </NumberProvider>
          </DriverProvider>
        </MembershipProvider>
      </ProfileProvider>
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
