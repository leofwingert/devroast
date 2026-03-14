import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import {
	CodeBlock,
	CodeBlockBody,
	CodeBlockHeader,
} from "@/components/ui/code-block";
import { DiffLine } from "@/components/ui/diff-line";
import { ScoreRing } from "@/components/ui/score-ring";

// ---------------------------------------------------------------------------
// Static data (will be replaced with DB queries later)
// ---------------------------------------------------------------------------

const staticRoast = {
	score: 3.5,
	verdict: "needs_serious_help" as const,
	language: "javascript",
	lineCount: 7,
	roastComment:
		'"This code is what happens when you learn JavaScript from Stack Overflow answers sorted by oldest first."',
	code: `function calculateTotal(items) {
  var total = 0;
  for (var i = 0; i < items.length; i++) {
    total = total + items[i].price * items[i].quantity;
    if (items[i].discount) {
      total = total - items[i].discount;
    }
  }
  total = total * 1.08;
  total = Math.round(total * 100) / 100;
  return total;
}

// usage
var result = calculateTotal(cart);
console.log("Total: $" + result);`,
	issues: [
		{
			severity: "critical" as const,
			title: "Using var instead of const/let",
			description:
				"var has function scope which leads to hoisting bugs. Always use const for values that don't change, let for ones that do.",
		},
		{
			severity: "critical" as const,
			title: "No input validation",
			description:
				"Function will throw on null/undefined input. Add guard clauses to handle edge cases gracefully.",
		},
		{
			severity: "warning" as const,
			title: "Hardcoded tax rate",
			description:
				"Magic number 1.08 should be a named constant. Makes it easier to update and self-documents the intent.",
		},
		{
			severity: "good" as const,
			title: "Correct rounding approach",
			description:
				"Using Math.round with multiplication is the right pattern for currency. Avoids floating-point display issues.",
		},
	],
	diffHeader: "your_code.js → improved_code.js",
	diffLines: [
		{ type: "removed" as const, content: "function calculateTotal(items) {" },
		{
			type: "added" as const,
			content: "const TAX_RATE = 0.08;",
		},
		{ type: "added" as const, content: "" },
		{
			type: "added" as const,
			content: "function calculateTotal(items = []) {",
		},
		{
			type: "removed" as const,
			content: "  var total = 0;",
		},
		{
			type: "added" as const,
			content: "  const total = items.reduce((sum, item) => {",
		},
		{
			type: "removed" as const,
			content: "  for (var i = 0; i < items.length; i++) {",
		},
		{
			type: "removed" as const,
			content: "    total = total + items[i].price * items[i].quantity;",
		},
		{
			type: "removed" as const,
			content: "    if (items[i].discount) {",
		},
		{
			type: "removed" as const,
			content: "      total = total - items[i].discount;",
		},
		{
			type: "removed" as const,
			content: "    }",
		},
		{
			type: "removed" as const,
			content: "  }",
		},
		{
			type: "added" as const,
			content: "    const subtotal = item.price * item.quantity;",
		},
		{
			type: "added" as const,
			content: "    const discount = item.discount ?? 0;",
		},
		{
			type: "added" as const,
			content: "    return sum + subtotal - discount;",
		},
		{
			type: "added" as const,
			content: "  }, 0);",
		},
		{ type: "context" as const, content: "" },
		{
			type: "removed" as const,
			content: "  total = total * 1.08;",
		},
		{
			type: "removed" as const,
			content: "  total = Math.round(total * 100) / 100;",
		},
		{
			type: "removed" as const,
			content: "  return total;",
		},
		{
			type: "added" as const,
			content: "  return Math.round(total * (1 + TAX_RATE) * 100) / 100;",
		},
		{ type: "context" as const, content: "}" },
	],
};

const verdictLabels: Record<string, string> = {
	needs_serious_help: "needs_serious_help",
	rough_around_the_edges: "rough_around_the_edges",
	not_terrible: "not_terrible",
	actually_decent: "actually_decent",
	solid_code: "solid_code",
};

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({
	params,
}: {
	params: Promise<{ id: string }>;
}): Promise<Metadata> {
	const { id } = await params;
	return {
		title: `Roast ${id.slice(0, 8)}… - DevRoast`,
		description: staticRoast.roastComment,
		openGraph: {
			title: `Score: ${staticRoast.score}/10 - DevRoast`,
			description: staticRoast.roastComment,
		},
	};
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function RoastResultPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	await params;

	return (
		<main className="flex w-full flex-col items-center">
			<section className="flex w-full max-w-[1280px] flex-col gap-10 px-20 py-10">
				{/* ── Score Hero ─────────────────────────────────── */}
				<div className="flex items-center gap-12">
					<ScoreRing score={staticRoast.score} />

					<div className="flex flex-1 flex-col gap-4">
						<Badge variant={verdictToBadge(staticRoast.verdict)}>
							{verdictLabels[staticRoast.verdict]}
						</Badge>

						<p className="font-mono text-xl leading-relaxed text-text-primary">
							{staticRoast.roastComment}
						</p>

						<div className="flex items-center gap-4">
							<span className="font-mono text-xs text-text-tertiary">
								lang: {staticRoast.language} &middot; {staticRoast.lineCount}{" "}
								lines
							</span>

							<Button variant="ghost" size="sm">
								share_roast
							</Button>
						</div>
					</div>
				</div>

				<Divider />

				{/* ── Submitted Code ────────────────────────────── */}
				<div className="flex flex-col gap-4">
					<SectionTitle>{"// your_submission"}</SectionTitle>

					<CodeBlock>
						<CodeBlockBody code={staticRoast.code} language="javascript" />
					</CodeBlock>
				</div>

				<Divider />

				{/* ── Detailed Analysis ─────────────────────────── */}
				<div className="flex flex-col gap-4">
					<SectionTitle>{"// detailed_analysis"}</SectionTitle>

					<div className="grid grid-cols-2 gap-5">
						{staticRoast.issues.map((issue) => (
							<Card key={issue.title}>
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
				<div className="flex flex-col gap-4">
					<SectionTitle>{"// suggested_fix"}</SectionTitle>

					<CodeBlock>
						<CodeBlockHeader>
							<span className="font-mono text-xs text-text-secondary">
								{staticRoast.diffHeader}
							</span>
						</CodeBlockHeader>
						<div>
							{staticRoast.diffLines.map((line, i) => (
								<DiffLine
									key={`diff-${
										// biome-ignore lint/suspicious/noArrayIndexKey: diff lines are static
										i
									}`}
									type={line.type}
								>
									{line.content}
								</DiffLine>
							))}
						</div>
					</CodeBlock>
				</div>
			</section>
		</main>
	);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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
