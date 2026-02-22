// src/main.jsx
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "./index.css";

import ProfileProvider from "@/app/providers/ProfileProvider";
import AppProvider from "@app/providers/AppProvider";
import ClubProvider from "@app/providers/ClubProvider";
import ThemeProvider from "@app/providers/ThemeProvider";
import AppRoutes from "./app/routes.jsx";
import "uno.css";

function Root() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ProfileProvider>
          <AppProvider>
            <ClubProvider>
              <AppRoutes />
            </ClubProvider>
          </AppProvider>
        </ProfileProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Root />);
