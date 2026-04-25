import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { createActor } from "../backend";
import type { Position } from "../backend.d";
import { useAuth } from "./useAuth";

export function useOpenPositions() {
  const { actor, isFetching: actorLoading } = useActor(createActor);
  const { isAuthenticated, principal } = useAuth();

  const query = useQuery<Position[]>({
    queryKey: ["openPositions", principal],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getMyOpenPositions();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !actorLoading && isAuthenticated,
    staleTime: 4_000,
    refetchInterval: 5_000,
  });

  return {
    positions: query.data ?? [],
    loading: query.isLoading || actorLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}

export function useClosedPositions(limit?: number) {
  const { actor, isFetching: actorLoading } = useActor(createActor);
  const { isAuthenticated, principal } = useAuth();

  const resolvedLimit = BigInt(limit ?? 50);

  const query = useQuery<Position[]>({
    queryKey: ["closedPositions", principal, limit],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getMyClosedPositions(resolvedLimit);
      } catch {
        return [];
      }
    },
    enabled: !!actor && !actorLoading && isAuthenticated,
    staleTime: 25_000,
    refetchInterval: 30_000,
  });

  return {
    positions: query.data ?? [],
    loading: query.isLoading || actorLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}
