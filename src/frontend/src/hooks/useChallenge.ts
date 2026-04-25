import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { createActor } from "../backend";
import type { Challenge } from "../backend.d";
import { ChallengeStatus } from "../backend.d";
import { useAuth } from "./useAuth";

export function useChallenge() {
  const { actor, isFetching: actorLoading } = useActor(createActor);
  const { isAuthenticated, principal } = useAuth();

  const query = useQuery<Challenge | null>({
    queryKey: ["challenge", principal],
    queryFn: async () => {
      if (!actor) return null;
      try {
        const result = await actor.getMyChallenge();
        if (result.__kind__ === "ok") {
          return result.ok;
        }
        return null;
      } catch {
        return null;
      }
    },
    enabled: !!actor && !actorLoading && isAuthenticated,
    staleTime: 4_000,
    refetchInterval: 5_000,
  });

  return {
    challenge: query.data ?? null,
    isLoading: query.isLoading || actorLoading,
    isError: query.isError,
    refetch: query.refetch,
    hasActiveChallenge: query.data?.status === ChallengeStatus.active,
  };
}
