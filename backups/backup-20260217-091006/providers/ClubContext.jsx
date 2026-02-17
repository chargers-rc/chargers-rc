import React from "react";

const ClubContext = React.createContext({
  club: null,
  loadingClub: true,
  setClub: () => {},
});

export default ClubContext;
