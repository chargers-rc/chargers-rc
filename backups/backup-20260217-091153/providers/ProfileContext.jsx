import { createContext } from "react";

const ProfileContext = createContext({
  user: null,
  profile: null,
  membership: null,
  loading: true,
});

export default ProfileContext;
