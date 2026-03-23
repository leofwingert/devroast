import { getCachedLeaderboard, getCachedStats } from "@/lib/get-cached-data";
import { HydrateClient } from "@/trpc/server";
import { LeaderboardContent } from "./leaderboard-content";

/** Revalidate data every 30s to keep pages fast with near-real-time data */
export const revalidate = 30;

export default async function LeaderboardPage() {
	const [statsResult, entriesResult] = await Promise.allSettled([
		getCachedStats(),
		getCachedLeaderboard(20),
	]);
	const stats =
		statsResult.status === "fulfilled"
			? statsResult.value
			: { totalRoasts: 0, avgScore: 0 };
	const entries =
		entriesResult.status === "fulfilled" ? entriesResult.value : [];

	return (
		<HydrateClient>
			<LeaderboardContent stats={stats} entries={entries} />
		</HydrateClient>
	);
}
