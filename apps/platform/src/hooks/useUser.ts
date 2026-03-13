/**
 * useUser — returns current user from auth context (COMP-032.2).
 * Must be used within AuthProvider.
 */

import { useAuthContext } from "@/components/auth/AuthProvider";

export interface UseUserResult {
  user: ReturnType<typeof useAuthContext>["user"];
  session: ReturnType<typeof useAuthContext>["session"];
  loading: boolean;
  error: Error | null;
}

export function useUser(): UseUserResult {
  const { user, session, loading, error } = useAuthContext();
  return { user, session, loading, error };
}
