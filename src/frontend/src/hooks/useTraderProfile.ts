import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createActor } from "../backend";
import type { TraderProfile } from "../backend.d";
import { useAuth } from "./useAuth";

export function useTraderProfile() {
  const { actor, isFetching: actorLoading } = useActor(createActor);
  const { isAuthenticated, principal } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery<TraderProfile | null>({
    queryKey: ["traderProfile", principal],
    queryFn: async () => {
      if (!actor) return null;
      try {
        const result = await actor.getMyProfile();
        if (result.__kind__ === "ok") {
          return result.ok;
        }
        return null;
      } catch {
        return null;
      }
    },
    enabled: !!actor && !actorLoading && isAuthenticated,
    staleTime: 30_000,
  });

  const register = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      const result = await actor.registerTrader();
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["traderProfile", principal] });
    },
  });

  return {
    profile: query.data ?? null,
    isLoading: query.isLoading || actorLoading,
    isError: query.isError,
    refetch: query.refetch,
    register: register.mutateAsync,
    isRegistering: register.isPending,
  };
}
