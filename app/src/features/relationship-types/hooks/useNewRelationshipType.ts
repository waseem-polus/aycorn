import { createContext, useContext } from "react";

type NewRelationshipTypeContextValue = {
  /** The link just created, whose name should take focus once its row renders. */
  focusId: number | null;
  /** Called once the name has taken focus, so later remounts don't steal it again. */
  clearFocusId: () => void;
};

export const NewRelationshipTypeContext =
  createContext<NewRelationshipTypeContextValue>({
    focusId: null,
    clearFocusId: () => {},
  });

export const useNewRelationshipType = () => useContext(NewRelationshipTypeContext);
