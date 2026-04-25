import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { createActor } from "../backend";
import type { InvestorStats } from "../backend.d";

export function useInvestorStats() {
  const { actor, isFetching: actorLoading } = useActor(createActor);

  const query = useQuery<InvestorStats | undefined>({
    queryKey: ["investorStats"],
    queryFn: async () => {
      if (!actor) return undefined;
      try {
        const result = await actor.getInvestorStats();
        if (result.__kind__ === "ok") return result.ok;
        return undefined;
      } catch {
        return undefined;
      }
    },
    enabled: !!actor && !actorLoading,
    staleTime: 25_000,
    refetchInterval: 30_000,
  });

  return {
    stats: query.data,
    loading: query.isLoading || actorLoading,
    error: query.error as Error | null,
  };
}

export function useFundedTraderList() {
  const { actor, isFetching: actorLoading } = useActor(createActor);

  const query = useQuery<
    Array<{
      status: string;
      traderId: import("@icp-sdk/core/principal").Principal;
      username: string;
      monthlyReturn: number;
      allocation: number;
      consistencyScore: number;
    }>
  >({
    queryKey: ["fundedTraderList"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getFundedTraderList();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !actorLoading,
    staleTime: 55_000,
    refetchInterval: 60_000,
  });

  return {
    traders: query.data ?? [],
    loading: query.isLoading || actorLoading,
    error: query.error as Error | null,
  };
}
