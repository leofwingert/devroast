import type { BundledLanguage } from "shiki";
import { codeToHtml } from "shiki";
import { tv } from "tailwind-variants";

const leaderboardEntryVariants = tv({
	base: "flex flex-col border border-border-primary",
});

const entryMetaVariants = tv({
	base: "flex h-12 items-center justify-between border-b border-border-primary px-5",
});

type LeaderboardEntryProps = React.ComponentProps<"div"> & {
	className?: string;
};

type EntryMetaProps = React.ComponentProps<"div"> & {
	rank: number;
	score: number;
	language: string;
	lineCount: number;
	className?: string;
};

type EntryCodeProps = {
	code: string;
	language: BundledLanguage;
	className?: string;
};

function LeaderboardEntry({
	className,
	children,
	...props
}: LeaderboardEntryProps) {
	return (
		<div className={leaderboardEntryVariants({ className })} {...props}>
			{children}
		</div>
	);
}

function EntryMeta({
	rank,
	score,
	language,
	lineCount,
	className,
	...props
}: EntryMetaProps) {
	return (
		<div className={entryMetaVariants({ className })} {...props}>
			<div className="flex items-center gap-4">
				<div className="flex items-center gap-1.5">
					<span className="font-mono text-xs text-text-tertiary">#</span>
					<span className="font-mono text-[13px] font-bold text-accent-amber">
						{rank}
					</span>
				</div>
				<div className="flex items-center gap-1.5">
					<span className="font-mono text-xs text-text-tertiary">score:</span>
					<span className="font-mono text-[13px] font-bold text-accent-red">
						{score.toFixed(1)}
					</span>
				</div>
			</div>
			<div className="flex items-center gap-3">
				<span className="font-mono text-xs text-text-secondary">
					{language}
				</span>
				<span className="font-mono text-xs text-text-tertiary">
					{lineCount} {lineCount === 1 ? "line" : "lines"}
				</span>
			</div>
		</div>
	);
}

async function EntryCode({ code, language, className }: EntryCodeProps) {
	const html = await codeToHtml(code, {
		lang: language,
		theme: "vesper",
	});

	const lines = code.split("\n");

	return (
		<div
			className={`flex h-[120px] overflow-hidden border border-border-primary bg-bg-input ${className ?? ""}`}
		>
			{/* Line numbers */}
			<div className="flex w-10 flex-col items-end border-r border-border-primary bg-bg-surface px-2.5 py-3.5">
				{lines.map((_, i) => (
					<span
						key={`ln-${
							// biome-ignore lint/suspicious/noArrayIndexKey: line numbers are stable
							i
						}`}
						className="font-mono text-xs leading-[22px] text-text-tertiary"
					>
						{i + 1}
					</span>
				))}
			</div>

			{/* Code */}
			<div
				className="flex-1 overflow-x-auto px-4 py-3.5 font-mono text-xs leading-[22px] [&_pre]:!bg-transparent [&_code]:!bg-transparent"
				dangerouslySetInnerHTML={{ __html: html }}
			/>
		</div>
	);
}

export {
	EntryCode,
	type EntryCodeProps,
	EntryMeta,
	type EntryMetaProps,
	entryMetaVariants,
	LeaderboardEntry,
	type LeaderboardEntryProps,
	leaderboardEntryVariants,
};
