import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { LeaderboardContent } from "./leaderboard-content";

/** Revalidate data every hour */
export const revalidate = 3600;

export default async function LeaderboardPage() {
	await Promise.all([
		prefetch(trpc.leaderboard.getTop.queryOptions({ limit: 20 })),
		prefetch(trpc.stats.getSummary.queryOptions()),
	]);

	return (
		<HydrateClient>
			<LeaderboardContent />
		</HydrateClient>
	);
}
