import { createContext } from "react";

const MembershipContext = createContext({
  membership: null,
  loadingMembership: true,
  isExpired: false,
  expiresSoon: false,
  refreshMembership: () => {},
  renewMembership: () => {},
});

export default MembershipContext;
