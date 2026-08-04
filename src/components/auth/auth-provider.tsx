'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { fetchMe, logout as logoutRequest, type AuthUser } from '@/lib/auth-api';

interface AuthContextValue {
  user: AuthUser | null;
  /**
   * The first /me call has come back.
   *
   * Until it has, the answer is unknown — not "signed out". Rendering a Login
   * link and then swapping it for a name makes the header flicker on every
   * page load, and flicker reads as a broken site.
   */
  isReady: boolean;
  isSignedIn: boolean;
  setUser: (user: AuthUser) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetchMe()
      .then((result) => {
        if (!cancelled) setUserState(result.user);
      })
      .catch(() => {
        // A 401 here is the ordinary case: most visitors are not signed in.
        // Anything else — backend down, network gone — has the same outcome
        // for this component, so both are treated as "no session".
        if (!cancelled) setUserState(null);
      })
      .finally(() => {
        if (!cancelled) setIsReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  /** Set straight from the verify response, so no second round trip is needed. */
  const setUser = useCallback((next: AuthUser) => setUserState(next), []);

  const signOut = useCallback(async () => {
    // Cleared locally regardless of what the server says: if the request
    // failed, leaving the interface claiming they are still signed in is worse
    // than clearing it and letting an expired cookie fall away on its own.
    await logoutRequest().catch(() => undefined);
    setUserState(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isReady, isSignedIn: user !== null, setUser, signOut }),
    [user, isReady, setUser, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }

  return context;
}
