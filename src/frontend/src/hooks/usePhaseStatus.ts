import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { createActor } from "../backend";
import type { ChallengePhase } from "../backend.d";
import { useAuth } from "./useAuth";

interface PhaseStatus {
  phase: ChallengePhase;
  timeRemainingDays: bigint;
  profitProgress: number;
  consistencyProgress: number;
}

export function usePhaseStatus() {
  const { actor, isFetching: actorLoading } = useActor(createActor);
  const { isAuthenticated, principal } = useAuth();

  const query = useQuery<PhaseStatus | undefined>({
    queryKey: ["phaseStatus", principal],
    queryFn: async () => {
      if (!actor) return undefined;
      try {
        const result = await actor.getMyPhaseStatus();
        if (result.__kind__ === "ok") return result.ok;
        return undefined;
      } catch {
        return undefined;
      }
    },
    enabled: !!actor && !actorLoading && isAuthenticated,
    staleTime: 4_000,
    refetchInterval: 5_000,
  });

  return {
    phase: query.data?.phase,
    timeRemainingDays: query.data?.timeRemainingDays,
    profitProgress: query.data?.profitProgress,
    consistencyProgress: query.data?.consistencyProgress,
    loading: query.isLoading || actorLoading,
    error: query.error as Error | null,
  };
}
