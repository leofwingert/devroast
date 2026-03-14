import { tv } from "tailwind-variants";

const stackVariants = tv({
	base: "flex flex-col gap-5",
});

const entryMetaVariants = tv({
	base: "flex h-12 items-center justify-between border-b border-border-primary bg-bg-surface px-5",
});

const metaLeftVariants = tv({
	base: "flex items-center gap-4",
});

const metaRightVariants = tv({
	base: "flex items-center gap-3",
});

const skeletonBarVariants = tv({
	base: "animate-pulse rounded bg-bg-elevated",
});

function SkeletonCard() {
	return (
		<div className="overflow-hidden border border-border-primary bg-bg-input">
			<div className={entryMetaVariants()}>
				<div className={metaLeftVariants()}>
					<div
						className={skeletonBarVariants({
							className: "h-4 w-6",
						})}
					/>
					<div
						className={skeletonBarVariants({
							className: "h-4 w-10",
						})}
					/>
				</div>
				<div className={metaRightVariants()}>
					<div
						className={skeletonBarVariants({
							className: "h-4 w-16",
						})}
					/>
					<div
						className={skeletonBarVariants({
							className: "h-4 w-12",
						})}
					/>
				</div>
			</div>

			<div className="flex">
				<div className="flex flex-col gap-1.5 border-r border-border-primary bg-bg-surface px-2.5 py-3">
					{Array.from({ length: 3 }, (_, j) => (
						<div
							// biome-ignore lint/suspicious/noArrayIndexKey: stable skeleton lines
							key={`skeleton-ln-${j}`}
							className={skeletonBarVariants({
								className: "h-4 w-4",
							})}
						/>
					))}
				</div>
				<div className="flex flex-1 flex-col gap-1.5 p-3">
					<div
						className={skeletonBarVariants({
							className: "h-4 w-4/5",
						})}
					/>
					<div
						className={skeletonBarVariants({
							className: "h-4 w-3/5",
						})}
					/>
					<div
						className={skeletonBarVariants({
							className: "h-4 w-2/3",
						})}
					/>
				</div>
			</div>
		</div>
	);
}

export default function LeaderboardLoading() {
	return (
		<main className="flex w-full flex-col items-center">
			<section className="flex w-full max-w-[1280px] flex-col gap-10 px-20 py-10">
				<div className="flex flex-col gap-4">
					<div className="flex items-center gap-3">
						<span className="font-mono text-[32px] font-bold text-accent-green">
							{">"}
						</span>
						<h1 className="font-mono text-[28px] font-bold text-text-primary">
							shame_leaderboard
						</h1>
					</div>
					<p className="font-mono text-sm text-text-secondary">
						{"// the most roasted code on the internet"}
					</p>
					<div className="flex items-center gap-2">
						<div
							className={skeletonBarVariants({
								className: "h-4 w-24",
							})}
						/>
						<span className="font-mono text-xs text-text-tertiary">
							&middot;
						</span>
						<div
							className={skeletonBarVariants({
								className: "h-4 w-20",
							})}
						/>
					</div>
				</div>

				<div className={stackVariants()}>
					{Array.from({ length: 20 }, (_, i) => (
						<SkeletonCard
							// biome-ignore lint/suspicious/noArrayIndexKey: stable skeleton cards
							key={`skeleton-${i}`}
						/>
					))}
				</div>
			</section>
		</main>
	);
}
