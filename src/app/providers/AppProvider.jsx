import NotificationProvider from "./NotificationProvider";
import AuthProvider from "./AuthProvider";

export default function AppProvider({ children }) {
  return (
    <AuthProvider>
      <NotificationProvider>
        {children}
      </NotificationProvider>
    </AuthProvider>
  );
}
