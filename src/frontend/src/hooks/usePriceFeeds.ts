import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { createActor } from "../backend";
import type { PriceCache } from "../backend.d";
import { DexSource } from "../backend.d";

export interface PriceFeedResult {
  price: PriceCache | undefined;
  loading: boolean;
  error: Error | null;
  /** Milliseconds since last update */
  ageMs: number;
  /** True if price is older than 60 seconds */
  isStale: boolean;
  /** Human-readable freshness label: "Updated 3s ago" */
  freshnessLabel: string;
}

function computeAgeMs(price: PriceCache | undefined): number {
  if (!price) return 0;
  return Date.now() - Number(price.timestamp) / 1_000_000;
}

function freshnessLabel(ageMs: number): string {
  if (ageMs < 2000) return "Updated just now";
  if (ageMs < 60_000) return `Updated ${Math.floor(ageMs / 1000)}s ago`;
  if (ageMs < 3_600_000) return `Updated ${Math.floor(ageMs / 60_000)}m ago`;
  return "Price data is stale";
}

export function usePriceFeeds(pair: string, dex: string): PriceFeedResult {
  const { actor, isFetching: actorLoading } = useActor(createActor);

  const dexSource = dex === "sonic" ? DexSource.sonic : DexSource.icpSwap;

  const query = useQuery<PriceCache | undefined>({
    queryKey: ["priceSnapshot", pair, dex],
    queryFn: async () => {
      if (!actor) return undefined;
      try {
        const result = await actor.getPriceSnapshot(pair, dexSource);
        return result ?? undefined;
      } catch {
        return undefined;
      }
    },
    enabled: !!actor && !actorLoading && !!pair && !!dex,
    staleTime: 1_000,
    refetchInterval: 2_000,
  });

  const price = query.data;
  const ageMs = computeAgeMs(price);
  const isStale = price?.stale === true || ageMs > 60_000;

  return {
    price,
    loading: query.isLoading || actorLoading,
    error: query.error as Error | null,
    ageMs,
    isStale,
    freshnessLabel: price ? freshnessLabel(ageMs) : "No price data",
  };
}
