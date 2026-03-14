import { getCachedLeaderboard, getCachedStats } from "@/lib/get-cached-data";
import { HydrateClient } from "@/trpc/server";
import { HomeContent } from "./home-content";

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
