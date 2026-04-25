import { c as createLucideIcon, d as useActor, a as useAuth, e as useQuery, C as ChallengeStatus, f as createActor } from "./index-n7jmytJ0.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "m9 12 2 2 4-4", key: "dzmm74" }]
];
const CircleCheck = createLucideIcon("circle-check", __iconNode);
function useChallenge() {
  var _a;
  const { actor, isFetching: actorLoading } = useActor(createActor);
  const { isAuthenticated, principal } = useAuth();
  const query = useQuery({
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
    staleTime: 4e3,
    refetchInterval: 5e3
  });
  return {
    challenge: query.data ?? null,
    isLoading: query.isLoading || actorLoading,
    isError: query.isError,
    refetch: query.refetch,
    hasActiveChallenge: ((_a = query.data) == null ? void 0 : _a.status) === ChallengeStatus.active
  };
}
export {
  CircleCheck as C,
  useChallenge as u
};
