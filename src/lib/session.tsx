/** The signed-in user and short confirmation messages, available to every screen. */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { User } from "../shared/types";
import { api } from "./api";

interface Session {
  user: User | null;
  ready: boolean;
  setUser: (user: User | null) => void;
  toast: (message: string) => void;
}

const SessionContext = createContext<Session | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    api<{ user: User | null }>("/session")
      .then((session) => setUser(session.user))
      .catch(() => setUser(null))
      .finally(() => setReady(true));
    const onSignedOut = () => setUser(null);
    window.addEventListener("cantera:signed-out", onSignedOut);
    return () => window.removeEventListener("cantera:signed-out", onSignedOut);
  }, []);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 3200);
    return () => clearTimeout(timer);
  }, [message]);

  const toast = useCallback((text: string) => setMessage(text), []);
  const value = useMemo(() => ({ user, ready, setUser, toast }), [user, ready, toast]);

  return (
    <SessionContext.Provider value={value}>
      {children}
      {message && (
        <div className="toast" role="status">
          {message}
        </div>
      )}
    </SessionContext.Provider>
  );
}

export function useSession(): Session {
  return useContext(SessionContext) as Session;
}

export function useUser(): User {
  return useSession().user as User;
}
