import { createContext, useState } from "react";

export const ThemeContext = createContext(null);

export default function ThemeProvider({ children, initialTheme }) {
  const defaultTheme = {
    textColor: "#111111",
    background: "#f5f7fa",

    headerBackground: "transparent",
    headerTextColor: "#111111",

    cardBackground: "#ffffff",
    cardTextColor: "#111111",

    colors: {
      primary: "#007aff",
      secondary: "#ff3b30",
      accent: "#6ee7b7",
    },

    cardShadow: "0 4px 12px rgba(0,0,0,0.08)",

    logoUrl: null,
    backgroundImage: null,
    styleVariant: "modern",
  };

  const [theme, setTheme] = useState({
    ...defaultTheme,
    ...(initialTheme || {})
  });

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
