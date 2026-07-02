import { useUser, useClerk } from "@clerk/clerk-react";
import { trpc } from "@/lib/trpc";
import { useCallback, useMemo } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
};

export function useAuth(_options?: UseAuthOptions) {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();

  // Fetch the DB user record (role, etc.) via tRPC
  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    // Only fetch when Clerk says the user is signed in
    enabled: Boolean(isSignedIn),
  });

  const logout = useCallback(async () => {
    await signOut();
  }, [signOut]);

  const state = useMemo(() => {
    // Combine Clerk identity with DB user record
    const dbUser = meQuery.data ?? null;
    const user = isSignedIn && clerkUser
      ? {
          // DB fields (may be null until first sync)
          ...dbUser,
          // Always available from Clerk
          name: clerkUser.fullName ?? clerkUser.username ?? dbUser?.name ?? null,
          email: clerkUser.primaryEmailAddress?.emailAddress ?? dbUser?.email ?? null,
        }
      : null;

    return {
      user,
      loading: !isLoaded || (Boolean(isSignedIn) && meQuery.isLoading),
      error: meQuery.error ?? null,
      isAuthenticated: Boolean(isSignedIn),
    };
  }, [isLoaded, isSignedIn, clerkUser, meQuery.data, meQuery.error, meQuery.isLoading]);

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
  };
}
