import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createActor } from "../backend";
import type { AdminParams } from "../backend.d";
import type { RiskLevel } from "../backend.d";

const ADMIN_PARAMS_KEY = ["adminParams"];

export function useAdminParams() {
  const { actor, isFetching: actorLoading } = useActor(createActor);
  const queryClient = useQueryClient();

  const query = useQuery<AdminParams | null>({
    queryKey: ADMIN_PARAMS_KEY,
    queryFn: async () => {
      if (!actor) return null;
      try {
        const result = await actor.getAdminParams();
        return result;
      } catch {
        return null;
      }
    },
    enabled: !!actor && !actorLoading,
    staleTime: 60_000,
  });

  const updateParams = useMutation({
    mutationFn: async ({
      targetProfitPct,
      riskLevel,
    }: {
      targetProfitPct: number;
      riskLevel: RiskLevel;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      const result = await actor.setAdminParams(targetProfitPct, riskLevel);
      if (result.__kind__ === "err") throw new Error(result.err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_PARAMS_KEY });
    },
  });

  const setPauseTrading = useMutation({
    mutationFn: async (paused: boolean) => {
      if (!actor) throw new Error("Actor not ready");
      const result = await actor.setPauseTrading(paused);
      if (result.__kind__ === "err") throw new Error(result.err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_PARAMS_KEY });
    },
  });

  return {
    params: query.data ?? null,
    isLoading: query.isLoading || actorLoading,
    isError: query.isError,
    refetch: query.refetch,
    updateParams: updateParams.mutateAsync,
    isUpdating: updateParams.isPending,
    setPauseTrading: setPauseTrading.mutateAsync,
    isPausingResuming: setPauseTrading.isPending,
  };
}
