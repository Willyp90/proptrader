import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { createActor } from "../backend";
import type { PayoutRecord } from "../backend.d";
import { useAuth } from "./useAuth";

export function usePayoutHistory(
  startTime?: bigint,
  endTime?: bigint,
  limit?: number,
) {
  const { actor, isFetching: actorLoading } = useActor(createActor);
  const { isAuthenticated, principal } = useAuth();

  const resolvedLimit = BigInt(limit ?? 50);
  const resolvedStart = startTime ?? null;
  const resolvedEnd = endTime ?? null;

  const query = useQuery<PayoutRecord[]>({
    queryKey: [
      "payoutHistory",
      principal,
      startTime?.toString(),
      endTime?.toString(),
      limit,
    ],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getPayoutHistory(
          resolvedStart,
          resolvedEnd,
          resolvedLimit,
        );
      } catch {
        return [];
      }
    },
    enabled: !!actor && !actorLoading && isAuthenticated,
    staleTime: 55_000,
    refetchInterval: 60_000,
  });

  return {
    payouts: query.data ?? [],
    loading: query.isLoading || actorLoading,
    error: query.error as Error | null,
  };
}
