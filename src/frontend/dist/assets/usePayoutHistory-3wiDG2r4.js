import { d as useActor, a as useAuth, e as useQuery, f as createActor } from "./index-n7jmytJ0.js";
function useConsistencyScore() {
  const { actor, isFetching: actorLoading } = useActor(createActor);
  const { isAuthenticated, principal } = useAuth();
  const query = useQuery({
    queryKey: ["consistencyScore", principal],
    queryFn: async () => {
      if (!actor) return void 0;
      try {
        const result = await actor.getMyConsistencyScore();
        if (result.__kind__ === "ok") return result.ok;
        return void 0;
      } catch {
        return void 0;
      }
    },
    enabled: !!actor && !actorLoading && isAuthenticated,
    staleTime: 25e3,
    refetchInterval: 3e4
  });
  return {
    score: query.data,
    loading: query.isLoading || actorLoading,
    error: query.error
  };
}
function useFundedAccount() {
  const { actor, isFetching: actorLoading } = useActor(createActor);
  const { isAuthenticated, principal } = useAuth();
  const query = useQuery({
    queryKey: ["fundedAccount", principal],
    queryFn: async () => {
      if (!actor) return void 0;
      try {
        const result = await actor.getMyFundedAccount();
        if (result.__kind__ === "ok") return result.ok;
        return void 0;
      } catch {
        return void 0;
      }
    },
    enabled: !!actor && !actorLoading && isAuthenticated,
    staleTime: 55e3,
    refetchInterval: 6e4
  });
  return {
    funded: query.data,
    loading: query.isLoading || actorLoading,
    error: query.error
  };
}
function usePayoutHistory(startTime, endTime, limit) {
  const { actor, isFetching: actorLoading } = useActor(createActor);
  const { isAuthenticated, principal } = useAuth();
  const resolvedLimit = BigInt(limit ?? 50);
  const resolvedStart = startTime ?? null;
  const resolvedEnd = endTime ?? null;
  const query = useQuery({
    queryKey: [
      "payoutHistory",
      principal,
      startTime == null ? void 0 : startTime.toString(),
      endTime == null ? void 0 : endTime.toString(),
      limit
    ],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getPayoutHistory(
          resolvedStart,
          resolvedEnd,
          resolvedLimit
        );
      } catch {
        return [];
      }
    },
    enabled: !!actor && !actorLoading && isAuthenticated,
    staleTime: 55e3,
    refetchInterval: 6e4
  });
  return {
    payouts: query.data ?? [],
    loading: query.isLoading || actorLoading,
    error: query.error
  };
}
export {
  useFundedAccount as a,
  usePayoutHistory as b,
  useConsistencyScore as u
};
