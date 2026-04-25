import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { createActor } from "../backend";
import type { ConsistencyScore } from "../backend.d";
import { useAuth } from "./useAuth";

export function useConsistencyScoreHistory(limit = 10) {
  const { actor, isFetching: actorLoading } = useActor(createActor);
  const { isAuthenticated, principal } = useAuth();

  const query = useQuery<ConsistencyScore[]>({
    queryKey: ["consistencyScoreHistory", principal, limit],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getConsistencyScoreHistory(BigInt(limit));
      } catch {
        return [];
      }
    },
    enabled: !!actor && !actorLoading && isAuthenticated,
    staleTime: 55_000,
    refetchInterval: 60_000,
  });

  return {
    history: query.data ?? [],
    loading: query.isLoading || actorLoading,
    error: query.error as Error | null,
  };
}
