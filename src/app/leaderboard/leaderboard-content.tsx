"use client";

import { Collapsible } from "@base-ui/react/collapsible";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { tv } from "tailwind-variants";
import { CodeBlock, CodeBlockHeader } from "@/components/ui/code-block";
import { CodeBlockBodyClient } from "@/components/ui/code-block-client";
import { useTRPC } from "@/trpc/client";

const AUTO_EXPAND_LINE_THRESHOLD = 5;

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

	if (isShort) {
		return <CodeBlockBodyClient code={code} language={language} />;
	}

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

function LeaderboardContent() {
	const trpc = useTRPC();

	const { data: entries } = useQuery(
		trpc.leaderboard.getTop.queryOptions({ limit: 20 }),
	);
	const { data: stats } = useQuery(trpc.stats.getSummary.queryOptions());

	if (!entries || !stats) {
		return null;
	}

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
						<span className="font-mono text-xs text-text-tertiary">
							{stats.totalRoasts.toLocaleString()} submissions
						</span>
						<span className="font-mono text-xs text-text-tertiary">
							&middot;
						</span>
						<span className="font-mono text-xs text-text-tertiary">
							avg score: {stats.avgScore.toFixed(1)}/10
						</span>
					</div>
				</div>

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
			</section>
		</main>
	);
}

export { LeaderboardContent };
