import { createContext } from "react";

const RacerDirectoryContext = createContext({
  racers: [],
  loadingRacers: true,
  refreshRacers: () => {},
});

export default RacerDirectoryContext;
