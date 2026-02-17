import { createContext } from "react";

const AppContext = createContext({
  user: null,
  profile: null,
  membership: null,
  drivers: [],
  loading: true,

  refreshProfile: () => {},
  refreshMembership: () => {},
  refreshDrivers: () => {},
});

export default AppContext;
