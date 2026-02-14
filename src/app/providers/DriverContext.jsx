import { createContext } from "react";

const DriverContext = createContext({
  drivers: [],
  loadingDrivers: true,
  refreshDrivers: () => {},
});

export default DriverContext;
