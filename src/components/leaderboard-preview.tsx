"use client";

import { Collapsible } from "@base-ui/react/collapsible";
import Link from "next/link";
import { useState } from "react";
import { tv } from "tailwind-variants";
import { CodeBlock, CodeBlockHeader } from "@/components/ui/code-block";
import { CodeBlockBodyClient } from "@/components/ui/code-block-client";
import type { LeaderboardEntry } from "@/lib/get-cached-data";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Lines at or below this count skip the collapsible entirely */
const AUTO_EXPAND_LINE_THRESHOLD = 5;

// ---------------------------------------------------------------------------
// Variants
// ---------------------------------------------------------------------------

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

const metaLabelVariants = tv({
	base: "font-mono text-xs text-text-tertiary",
});

const rankValueVariants = tv({
	base: "font-mono text-[13px] font-bold text-accent-amber",
});

const scoreValueVariants = tv({
	base: "font-mono text-[13px] font-bold text-accent-red",
});

const langVariants = tv({
	base: "font-mono text-xs text-text-secondary",
});

const lineCountVariants = tv({
	base: "font-mono text-xs text-text-tertiary",
});

const collapsiblePanelVariants = tv({
	base: "relative overflow-hidden",
	variants: {
		collapsed: {
			true: "max-h-[120px]",
			false: "",
		},
	},
});

const gradientOverlayVariants = tv({
	base: "pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-bg-input to-transparent",
});

const triggerVariants = tv({
	base: "flex w-full cursor-pointer items-center justify-center gap-1.5 border-t border-border-primary bg-bg-surface py-2 font-mono text-xs text-text-tertiary transition-colors enabled:hover:text-text-secondary",
});

const footerVariants = tv({
	base: "flex justify-center",
});

const footerTextVariants = tv({
	base: "font-mono text-xs text-text-tertiary",
});

const footerLinkVariants = tv({
	base: "text-text-secondary transition-colors hover:text-text-primary",
});

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

const skeletonBarVariants = tv({
	base: "animate-pulse rounded bg-bg-elevated",
});

function LeaderboardPreviewSkeleton() {
	return (
		<>
			<div className={stackVariants()}>
				{Array.from({ length: 3 }, (_, i) => (
					<div
						key={`skeleton-card-${
							// biome-ignore lint/suspicious/noArrayIndexKey: stable skeleton cards
							i
						}`}
						className="overflow-hidden border border-border-primary bg-bg-input"
					>
						{/* Header skeleton */}
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

						{/* Code body skeleton */}
						<div className="flex">
							<div className="flex flex-col gap-1.5 border-r border-border-primary bg-bg-surface px-2.5 py-3">
								{Array.from({ length: 3 }, (_, j) => (
									<div
										key={`skeleton-ln-${
											// biome-ignore lint/suspicious/noArrayIndexKey: stable skeleton lines
											j
										}`}
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
				))}
			</div>

			{/* Footer skeleton */}
			<div className={footerVariants()}>
				<div className={skeletonBarVariants({ className: "h-4 w-56" })} />
			</div>
		</>
	);
}

// ---------------------------------------------------------------------------
// EntryMeta — header bar for each code block card
// ---------------------------------------------------------------------------

function EntryMeta({
	rank,
	score,
	language,
	lineCount,
}: {
	rank: number;
	score: number;
	language: string;
	lineCount: number;
}) {
	return (
		<CodeBlockHeader className="h-12 justify-between px-5">
			<div className={metaLeftVariants()}>
				<div className="flex items-center gap-1.5">
					<span className={metaLabelVariants()}>#</span>
					<span className={rankValueVariants()}>{rank}</span>
				</div>
				<div className="flex items-center gap-1.5">
					<span className={metaLabelVariants()}>score:</span>
					<span className={scoreValueVariants()}>{score.toFixed(1)}</span>
				</div>
			</div>
			<div className={metaRightVariants()}>
				<span className={langVariants()}>{language}</span>
				<span className={lineCountVariants()}>
					{lineCount} {lineCount === 1 ? "line" : "lines"}
				</span>
			</div>
		</CodeBlockHeader>
	);
}

// ---------------------------------------------------------------------------
// CollapsibleCodeBody — handles expand/collapse for long code snippets
// ---------------------------------------------------------------------------

function CollapsibleCodeBody({
	code,
	language,
}: {
	code: string;
	language: string;
}) {
	const lineCount = code.split("\n").length;
	const isShort = lineCount <= AUTO_EXPAND_LINE_THRESHOLD;
	const [open, setOpen] = useState(false);

	// Short code — no collapsible, just render directly
	if (isShort) {
		return <CodeBlockBodyClient code={code} language={language} />;
	}

	// Long code — clamp height when collapsed, full height when expanded.
	// We use Collapsible.Root + Trigger for accessible state management
	// but render the code body outside the Panel since we always want
	// content visible (not collapsed to zero height).
	return (
		<Collapsible.Root open={open} onOpenChange={setOpen}>
			<div
				className={collapsiblePanelVariants({
					collapsed: !open,
				})}
			>
				<CodeBlockBodyClient code={code} language={language} />
				{!open && <div className={gradientOverlayVariants()} aria-hidden />}
			</div>
			<Collapsible.Trigger className={triggerVariants()}>
				{open ? "show less \u25B2" : `show all ${lineCount} lines \u25BC`}
			</Collapsible.Trigger>
		</Collapsible.Root>
	);
}

// ---------------------------------------------------------------------------
// LeaderboardPreview
// ---------------------------------------------------------------------------

type LeaderboardPreviewProps = {
	entries: LeaderboardEntry[];
};

function LeaderboardPreview({ entries }: LeaderboardPreviewProps) {
	return (
		<>
			{/* Stacked code block cards */}
			<div className={stackVariants()}>
				{entries.map((entry) => {
					const lineCount = entry.code.split("\n").length;
					return (
						<CodeBlock key={entry.rank}>
							<EntryMeta
								rank={entry.rank}
								score={entry.score}
								language={entry.language}
								lineCount={lineCount}
							/>
							<CollapsibleCodeBody
								code={entry.code}
								language={entry.language}
							/>
						</CodeBlock>
					);
				})}
			</div>

			{/* Footer */}
			<div className={footerVariants()}>
				<span className={footerTextVariants()}>
					showing top {entries.length} codes ·{" "}
					<Link href="/leaderboard" className={footerLinkVariants()}>
						view full leaderboard {">>"}
					</Link>
				</span>
			</div>
		</>
	);
}

export { LeaderboardPreview, LeaderboardPreviewSkeleton };
