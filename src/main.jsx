// src/main.jsx
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./index.css";

import AuthProvider from "@/app/providers/AuthProvider";
import ThemeProvider from "@/app/providers/ThemeProvider";
import AppProviders from "@/app/providers/AppProviders";
import RoutesFile from "@/app/routes";
import "uno.css";

function Root() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route element={<AppProviders />}>
              <Route path="/*" element={<RoutesFile />} />
            </Route>
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Root />);
