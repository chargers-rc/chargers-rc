// src/app/providers/DriverContext.jsx
import React from "react";

/**
 * DriverContext
 * - Exports a named DriverContext and a default export for compatibility.
 * - Provides a stable default shape so consumers can destructure safely.
 */

export const DriverContext = React.createContext({
  drivers: [],
  loadingDrivers: true,
  refreshDrivers: async () => {},
});

export default DriverContext;
