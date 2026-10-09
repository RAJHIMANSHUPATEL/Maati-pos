import { createContext, useContext, useMemo, useState } from "react";
import { clearSession, getSession, setSession as persistSession } from "../utils/session";

const TillContext = createContext(null);

export const TillProvider = ({ children }) => {
  const [session, setSessionState] = useState(() => getSession());

  const value = useMemo(
    () => ({
      session,
      unlock: (next) => {
        persistSession(next);
        setSessionState(next);
      },
      lock: () => {
        clearSession();
        setSessionState(null);
      },
    }),
    [session]
  );

  return <TillContext.Provider value={value}>{children}</TillContext.Provider>;
};

export const useTill = () => {
  const ctx = useContext(TillContext);
  if (!ctx) throw new Error("useTill must be used within TillProvider");
  return ctx;
};
