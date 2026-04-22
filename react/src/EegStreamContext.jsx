import { createContext, useContext } from "react";
import { useEegStream } from "./useEegStream";

const EegStreamContext = createContext(null);

export function EegStreamProvider({ children }) {
  const eegStream = useEegStream();
  return <EegStreamContext.Provider value={eegStream}>{children}</EegStreamContext.Provider>;
}

export function useSharedEegStream() {
  const context = useContext(EegStreamContext);

  if (!context) {
    throw new Error("useSharedEegStream must be used within an EegStreamProvider.");
  }

  return context;
}
