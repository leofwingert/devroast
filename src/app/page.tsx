import { StatsCounter } from "@/components/stats-counter";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { HomeContent } from "./home-content";

export default async function Home() {
	prefetch(trpc.stats.getSummary.queryOptions());

	return (
		<HydrateClient>
			<HomeContent statsSlot={<StatsCounter />} />
		</HydrateClient>
	);
}
