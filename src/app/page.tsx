import { LeaderboardPreview } from "@/components/leaderboard-preview";
import { StatsCounter } from "@/components/stats-counter";
import { getCachedLeaderboard, getCachedStats } from "@/lib/get-cached-data";
import { HydrateClient } from "@/trpc/server";
import { HomeContent } from "./home-content";

/** Revalidate data every hour */
export const revalidate = 3600;

export default async function Home() {
	const [stats, entries] = await Promise.all([
		getCachedStats(),
		getCachedLeaderboard(3),
	]);

	return (
		<HydrateClient>
			<HomeContent
				statsSlot={<StatsCounter stats={stats} />}
				leaderboardSlot={<LeaderboardPreview entries={entries} />}
			/>
		</HydrateClient>
	);
}
