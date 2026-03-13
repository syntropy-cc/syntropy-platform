"use client";

/**
 * AuthProvider — wraps Supabase client and provides session/user via context (COMP-032.2).
 * Subscribes to onAuthStateChange so useUser() stays in sync.
 */

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: Error | null;
}

const defaultState: AuthState = {
  user: null,
  session: null,
  loading: true,
  error: null,
};

export const AuthContext = createContext<AuthState>(defaultState);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(defaultState);
  const supabase = createClient();

  const refresh = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) throw error;
      setState({
        user: session?.user ?? null,
        session: session ?? null,
        loading: false,
        error: null,
      });
    } catch (err) {
      setState({
        user: null,
        session: null,
        loading: false,
        error: err instanceof Error ? err : new Error(String(err)),
      });
    }
  }, [supabase.auth]);

  useEffect(() => {
    refresh();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({
        user: session?.user ?? null,
        session: session ?? null,
        loading: false,
        error: null,
      });
    });
    return () => subscription.unsubscribe();
  }, [supabase.auth, refresh]);

  return (
    <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
  );
}

export function useAuthContext(): AuthState {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
}
