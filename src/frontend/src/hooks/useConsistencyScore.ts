import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { createActor } from "../backend";
import type { ConsistencyScore } from "../backend.d";
import { useAuth } from "./useAuth";

export function useConsistencyScore() {
  const { actor, isFetching: actorLoading } = useActor(createActor);
  const { isAuthenticated, principal } = useAuth();

  const query = useQuery<ConsistencyScore | undefined>({
    queryKey: ["consistencyScore", principal],
    queryFn: async () => {
      if (!actor) return undefined;
      try {
        const result = await actor.getMyConsistencyScore();
        if (result.__kind__ === "ok") return result.ok;
        return undefined;
      } catch {
        return undefined;
      }
    },
    enabled: !!actor && !actorLoading && isAuthenticated,
    staleTime: 25_000,
    refetchInterval: 30_000,
  });

  return {
    score: query.data,
    loading: query.isLoading || actorLoading,
    error: query.error as Error | null,
  };
}
