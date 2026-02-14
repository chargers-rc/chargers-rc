import { useContext } from "react";
import MembershipContext from "@app/providers/MembershipContext";

export default function useMembership() {
  return useContext(MembershipContext);
}
