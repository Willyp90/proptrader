import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { createActor } from "../backend";
import type { FundedAccount } from "../backend.d";
import { useAuth } from "./useAuth";

export function useFundedAccount() {
  const { actor, isFetching: actorLoading } = useActor(createActor);
  const { isAuthenticated, principal } = useAuth();

  const query = useQuery<FundedAccount | undefined>({
    queryKey: ["fundedAccount", principal],
    queryFn: async () => {
      if (!actor) return undefined;
      try {
        const result = await actor.getMyFundedAccount();
        if (result.__kind__ === "ok") return result.ok;
        return undefined;
      } catch {
        return undefined;
      }
    },
    enabled: !!actor && !actorLoading && isAuthenticated,
    staleTime: 55_000,
    refetchInterval: 60_000,
  });

  return {
    funded: query.data,
    loading: query.isLoading || actorLoading,
    error: query.error as Error | null,
  };
}
