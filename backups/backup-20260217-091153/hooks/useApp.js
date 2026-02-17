import { useContext } from "react";
import AppContext from "@app/providers/AppContext";

export default function useApp() {
  return useContext(AppContext);
}
