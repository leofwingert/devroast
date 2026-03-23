import { getCachedLeaderboard, getCachedStats } from "@/lib/get-cached-data";
import { HydrateClient } from "@/trpc/server";
import { LeaderboardContent } from "./leaderboard-content";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
	const [stats, entries] = await Promise.all([
		getCachedStats(),
		getCachedLeaderboard(20),
	]);

	return (
		<HydrateClient>
			<LeaderboardContent stats={stats} entries={entries} />
		</HydrateClient>
	);
}
