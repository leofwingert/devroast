import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { LeaderboardContent } from "./leaderboard-content";

/** Force dynamic rendering — this page depends on live DB data */
export const dynamic = "force-dynamic";

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
