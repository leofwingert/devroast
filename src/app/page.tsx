import { LeaderboardPreview } from "@/components/leaderboard-preview";
import { StatsCounter } from "@/components/stats-counter";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { HomeContent } from "./home-content";

/** Revalidate data every hour */
export const revalidate = 3600;

export default async function Home() {
	/**
	 * Parallel prefetches via Promise.all — both queries execute concurrently
	 * on the server so the client receives all data in a single hydration pass.
	 * Without Promise.all the prefetches would still fire (they're void), but
	 * awaiting them together makes the intent explicit and ensures both resolve
	 * before streaming the shell to the client.
	 */
	await Promise.all([
		prefetch(trpc.stats.getSummary.queryOptions()),
		prefetch(trpc.leaderboard.getTop.queryOptions({ limit: 3 })),
	]);

	return (
		<HydrateClient>
			<HomeContent
				statsSlot={<StatsCounter />}
				leaderboardSlot={<LeaderboardPreview />}
			/>
		</HydrateClient>
	);
}
