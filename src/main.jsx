import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import ProfileProvider from "@app/providers/ProfileProvider";
import AppProvider from "@app/providers/AppProvider";
import ClubProvider from "@app/providers/ClubProvider";
import AppRoutes from "./app/routes.jsx";
import "uno.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <ProfileProvider>
      <AppProvider>
        <ClubProvider>
          <AppRoutes />
        </ClubProvider>
      </AppProvider>
    </ProfileProvider>
  </BrowserRouter>
);
