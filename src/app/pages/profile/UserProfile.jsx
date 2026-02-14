import { useContext } from "react";
import ProfileContext from "@app/providers/ProfileContext";

export default function useProfile() {
  return useContext(ProfileContext);
}
