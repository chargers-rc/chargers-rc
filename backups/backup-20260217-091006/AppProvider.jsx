import NotificationProvider from "./NotificationProvider";
import ProfileProvider from "./ProfileProvider";
import DriverProvider from "./DriverProvider";
import RacerDirectoryProvider from "./RacerDirectoryProvider";
import AuthProvider from "./AuthProvider";

export default function AppProvider({ children }) {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ProfileProvider>
          <DriverProvider>
            <RacerDirectoryProvider>
              {children}
            </RacerDirectoryProvider>
          </DriverProvider>
        </ProfileProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}
