// src/app/hooks/useMembership.js
import { useContext } from "react";
import { MembershipContext } from "@/app/providers/MembershipProvider";

export default function useMembership() {
  return useContext(MembershipContext);
}
