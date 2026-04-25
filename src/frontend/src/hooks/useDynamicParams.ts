import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { createActor } from "../backend";
import type { CohortParams, TargetOutcome } from "../backend.d";

export function useCohorts() {
  const { actor, isFetching: actorLoading } = useActor(createActor);

  const query = useQuery<CohortParams[]>({
    queryKey: ["cohorts"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllCohorts();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !actorLoading,
    staleTime: 55_000,
    refetchInterval: 60_000,
  });

  return {
    cohorts: query.data ?? [],
    loading: query.isLoading || actorLoading,
    error: query.error as Error | null,
  };
}

export function useTargetOutcomes(cohortId: bigint) {
  const { actor, isFetching: actorLoading } = useActor(createActor);

  const query = useQuery<TargetOutcome | undefined>({
    queryKey: ["targetOutcomes", cohortId.toString()],
    queryFn: async () => {
      if (!actor) return undefined;
      try {
        const result = await actor.getTargetOutcomes(cohortId);
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
    outcomes: query.data,
    loading: query.isLoading || actorLoading,
    error: query.error as Error | null,
  };
}

interface ParamSuggestion {
  metric: string;
  suggested: number;
  current: number;
  reason: string;
}

export function useParamSuggestions(cohortId: bigint) {
  const { actor, isFetching: actorLoading } = useActor(createActor);

  const query = useQuery<ParamSuggestion[]>({
    queryKey: ["paramSuggestions", cohortId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const result = await actor.suggestParamAdjustments(cohortId);
        if (result.__kind__ === "ok") return result.ok;
        return [];
      } catch {
        return [];
      }
    },
    enabled: !!actor && !actorLoading,
    staleTime: 55_000,
    refetchInterval: 60_000,
  });

  return {
    suggestions: query.data ?? [],
    loading: query.isLoading || actorLoading,
    error: query.error as Error | null,
  };
}
