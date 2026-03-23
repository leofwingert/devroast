import { LeaderboardPreview } from "@/components/leaderboard-preview";
import { StatsCounter } from "@/components/stats-counter";
import { getCachedLeaderboard, getCachedStats } from "@/lib/get-cached-data";
import { HydrateClient } from "@/trpc/server";
import { HomeContent } from "./home-content";

/** Revalidate data every 30s to keep pages fast with near-real-time data */
export const revalidate = 30;

export default async function Home() {
	const [statsResult, entriesResult] = await Promise.allSettled([
		getCachedStats(),
		getCachedLeaderboard(3),
	]);
	const stats =
		statsResult.status === "fulfilled"
			? statsResult.value
			: { totalRoasts: 0, avgScore: 0 };
	const entries =
		entriesResult.status === "fulfilled" ? entriesResult.value : [];

	return (
		<HydrateClient>
			<HomeContent
				statsSlot={<StatsCounter stats={stats} />}
				leaderboardSlot={<LeaderboardPreview entries={entries} />}
			/>
		</HydrateClient>
	);
}
