import { useContext } from "react";
import RacerDirectoryContext from "@app/providers/RacerDirectoryContext";

export default function useRacerDirectory() {
  return useContext(RacerDirectoryContext);
}
