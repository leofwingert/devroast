import { eq } from "drizzle-orm";
import Image from "next/image";
import { db } from "@/db";
import { roasts } from "@/db/schema";

export default async function RoastOpenGraphPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const ogImageUrl = `/roast/${id}/opengraph-image`;

	const [roast] = await db()
		.select({
			id: roasts.id,
		})
		.from(roasts)
		.where(eq(roasts.id, id))
		.limit(1);

	if (!roast) {
		return (
			<main className="flex w-full flex-col items-center">
				<section className="flex w-full max-w-7xl flex-col gap-6 px-20 py-10">
					<h1 className="font-mono text-2xl text-accent-red">
						Roast not found
					</h1>
				</section>
			</main>
		);
	}

	return (
		<main className="flex w-full flex-col items-center">
			<section className="flex w-full max-w-7xl flex-col gap-6 px-20 py-10">
				<h1 className="font-mono text-sm text-text-secondary">
					{"// opengraph_preview"}
				</h1>

				<div className="overflow-hidden border border-border-primary bg-bg-surface">
					<Image
						alt="DevRoast Open Graph preview"
						className="h-auto w-full"
						height={630}
						src={ogImageUrl}
						unoptimized
						width={1200}
					/>
				</div>

				<div className="flex items-center gap-3">
					<a
						className="inline-flex items-center border border-border-primary px-4 py-2 font-mono text-xs text-text-primary transition-colors hover:bg-border-primary/50 active:bg-border-primary/70"
						download={`devroast-roast-${id}.png`}
						href={ogImageUrl}
					>
						$ download_png
					</a>
					<a
						className="inline-flex items-center border border-border-primary px-4 py-2 font-mono text-xs text-text-primary transition-colors hover:bg-border-primary/50 active:bg-border-primary/70"
						href={`/roast/${id}`}
					>
						$ back_to_result
					</a>
				</div>
			</section>
		</main>
	);
}
