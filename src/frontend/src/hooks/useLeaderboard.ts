import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { createActor } from "../backend";
import type { LeaderboardEntry } from "../backend.d";

export function useLeaderboard(
  sortBy: string,
  timePeriodDays: number,
  limit: number,
) {
  const { actor, isFetching: actorLoading } = useActor(createActor);

  const query = useQuery<LeaderboardEntry[]>({
    queryKey: ["leaderboard", sortBy, timePeriodDays, limit],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getLeaderboard(
          sortBy,
          BigInt(timePeriodDays),
          BigInt(limit),
        );
      } catch {
        return [];
      }
    },
    enabled: !!actor && !actorLoading,
    staleTime: 25_000,
    refetchInterval: 30_000,
  });

  return {
    traders: query.data ?? [],
    loading: query.isLoading || actorLoading,
    error: query.error as Error | null,
  };
}
