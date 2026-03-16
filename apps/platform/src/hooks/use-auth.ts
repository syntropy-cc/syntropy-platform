/**
 * useAuth — compatibility hook for landing (syntropy reference).
 * Returns { user } from useUser for use in page.tsx.
 */

import { useUser } from "@/hooks/useUser";

export function useAuth() {
  const { user } = useUser();
  return { user };
}
