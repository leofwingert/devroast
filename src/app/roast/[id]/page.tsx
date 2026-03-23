import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import type { BundledLanguage } from "shiki";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import {
	CodeBlock,
	CodeBlockBody,
	CodeBlockHeader,
} from "@/components/ui/code-block";
import { DiffLine } from "@/components/ui/diff-line";
import { ScoreRing } from "@/components/ui/score-ring";
import { db } from "@/db";
import { diffLines, roastIssues, roasts, submissions } from "@/db/schema";

const verdictLabels: Record<string, string> = {
	needs_serious_help: "needs_serious_help",
	rough_around_the_edges: "rough_around_the_edges",
	not_terrible: "not_terrible",
	actually_decent: "actually_decent",
	solid_code: "solid_code",
};

export async function generateMetadata({
	params,
}: {
	params: Promise<{ id: string }>;
}): Promise<Metadata> {
	const { id } = await params;
	const ogImageUrl = `/roast/${id}/opengraph-image`;

	const [roast] = await db()
		.select()
		.from(roasts)
		.where(eq(roasts.id, id))
		.limit(1);

	if (!roast) {
		return {
			title: "Roast Not Found - DevRoast",
		};
	}

	return {
		title: `Score: ${roast.score}/10 - DevRoast`,
		description: roast.roastComment,
		openGraph: {
			title: `Score: ${roast.score}/10 - DevRoast`,
			description: roast.roastComment,
			images: [
				{
					url: ogImageUrl,
					width: 1200,
					height: 630,
					alt: "DevRoast result image",
				},
			],
		},
		twitter: {
			card: "summary_large_image",
			title: `Score: ${roast.score}/10 - DevRoast`,
			description: roast.roastComment,
			images: [ogImageUrl],
		},
	};
}

export default async function RoastResultPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;

	const [roast] = await db()
		.select()
		.from(roasts)
		.where(eq(roasts.id, id))
		.limit(1);

	if (!roast) {
		return (
			<main className="flex w-full flex-col items-center">
				<section className="flex w-full max-w-7xl flex-col gap-10 px-20 py-10">
					<h1 className="font-mono text-2xl text-accent-red">
						Roast not found
					</h1>
				</section>
			</main>
		);
	}

	const [submission] = await db()
		.select()
		.from(submissions)
		.where(eq(submissions.id, roast.submissionId))
		.limit(1);

	const issues = await db()
		.select()
		.from(roastIssues)
		.where(eq(roastIssues.roastId, roast.id))
		.orderBy(roastIssues.sortOrder);

	const diff = await db()
		.select()
		.from(diffLines)
		.where(eq(diffLines.roastId, roast.id))
		.orderBy(diffLines.lineNumber);

	const scoreNum = Number.parseFloat(roast.score);
	const ogPreviewUrl = `/roast/${roast.id}/opengraph`;

	return (
		<main className="flex w-full flex-col items-center">
			<section className="flex w-full max-w-7xl flex-col gap-10 px-20 py-10">
				{/* ── Score Hero ─────────────────────────────────── */}
				<div className="flex items-center gap-12">
					<ScoreRing score={scoreNum} />

					<div className="flex flex-1 flex-col gap-4">
						<Badge variant={verdictToBadge(roast.verdict)}>
							{verdictLabels[roast.verdict]}
						</Badge>

						<p className="font-mono text-xl leading-relaxed text-text-primary">
							{roast.roastComment}
						</p>

						<div className="flex items-center gap-4">
							<span className="font-mono text-xs text-text-tertiary">
								lang: {submission?.language ?? "unknown"} &middot;{" "}
								{submission?.lineCount ?? 0} lines
							</span>
							<div className="flex items-center gap-3">
								<a
									className="inline-flex items-center border border-border-primary px-4 py-2 font-mono text-xs text-text-primary transition-colors hover:bg-border-primary/50 active:bg-border-primary/70"
									href={ogPreviewUrl}
								>
									$ share_roast
								</a>
							</div>
						</div>
					</div>
				</div>

				<Divider />

				{/* ── Submitted Code ────────────────────────────── */}
				<div className="flex flex-col gap-4">
					<SectionTitle>{"// your_submission"}</SectionTitle>

					<CodeBlock>
						<CodeBlockBody
							code={submission?.code ?? ""}
							language={getShikiLanguage(submission?.language)}
						/>
					</CodeBlock>
				</div>

				<Divider />

				{/* ── Detailed Analysis ─────────────────────────── */}
				<div className="flex flex-col gap-4">
					<SectionTitle>{"// detailed_analysis"}</SectionTitle>

					<div className="grid grid-cols-2 gap-5">
						{issues.map((issue) => (
							<Card key={issue.id}>
								<Badge variant={issue.severity}>{issue.severity}</Badge>
								<CardTitle>{issue.title}</CardTitle>
								<CardDescription className="leading-relaxed">
									{issue.description}
								</CardDescription>
							</Card>
						))}
					</div>
				</div>

				<Divider />

				{/* ── Suggested Fix (Diff) ──────────────────────── */}
				{diff.length > 0 && (
					<div className="flex flex-col gap-4">
						<SectionTitle>{"// suggested_fix"}</SectionTitle>

						<CodeBlock>
							<CodeBlockHeader>
								<span className="font-mono text-xs text-text-secondary">
									your_code.js → improved_code.js
								</span>
							</CodeBlockHeader>
							<div>
								{diff.map((line) => (
									<DiffLine key={line.id} type={line.type}>
										{line.content}
									</DiffLine>
								))}
							</div>
						</CodeBlock>
					</div>
				)}
			</section>
		</main>
	);
}

function verdictToBadge(verdict: string): "critical" | "warning" | "good" {
	switch (verdict) {
		case "needs_serious_help":
			return "critical";
		case "rough_around_the_edges":
			return "warning";
		case "not_terrible":
			return "warning";
		case "actually_decent":
			return "good";
		case "solid_code":
			return "good";
		default:
			return "warning";
	}
}

function SectionTitle({ children }: { children: React.ReactNode }) {
	return <h2 className="font-mono text-sm text-text-secondary">{children}</h2>;
}

function Divider() {
	return <hr className="border-border-primary" />;
}

function getShikiLanguage(
	language: string | null | undefined,
): BundledLanguage {
	if (!language) return "javascript";
	const validLanguages: BundledLanguage[] = [
		"javascript",
		"typescript",
		"python",
		"html",
		"css",
		"json",
		"sql",
		"rust",
		"go",
		"java",
		"csharp",
		"cpp",
		"c",
		"php",
		"ruby",
		"swift",
		"kotlin",
		"shellscript",
		"yaml",
		"markdown",
		"jsx",
		"tsx",
	];
	return validLanguages.includes(language as BundledLanguage)
		? (language as BundledLanguage)
		: "javascript";
}
