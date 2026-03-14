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
import { Toggle, ToggleLabel } from "@/components/ui/toggle";

const buttonVariants = [
	"primary",
	"secondary",
	"ghost",
	"destructive",
] as const;
const buttonSizes = ["sm", "md", "lg"] as const;

const sampleCode = `function roastCode(code: string) {
  const score = analyze(code);
  if (score < 3) {
    return "This code needs serious help.";
  }
  return "Not bad, but I've seen better.";
}`;

export default function ComponentsPage() {
	return (
		<div className="min-h-screen bg-bg-page p-12">
			<div className="mx-auto flex max-w-4xl flex-col gap-16">
				<header className="flex flex-col gap-2">
					<h1 className="font-mono text-2xl font-bold text-text-primary">
						{"// component_library"}
					</h1>
					<p className="font-mono text-sm text-text-secondary">
						$ all ui components and their variants
					</p>
				</header>

				{/* Buttons */}
				<section className="flex flex-col gap-8">
					<h2 className="font-mono text-lg font-bold text-text-primary">
						<span className="text-accent-green">{"// "}</span>
						{"buttons"}
					</h2>

					<div className="flex flex-col gap-6">
						{buttonVariants.map((variant) => (
							<div key={variant} className="flex flex-col gap-3">
								<p className="font-mono text-xs text-text-tertiary">
									variant=&quot;{variant}&quot;
								</p>
								<div className="flex items-center gap-4">
									{buttonSizes.map((size) => (
										<Button key={size} variant={variant} size={size}>
											$ {variant}_{size}
										</Button>
									))}
									<Button variant={variant} size="md" disabled>
										$ disabled
									</Button>
								</div>
							</div>
						))}
					</div>
				</section>

				{/* Badges */}
				<section className="flex flex-col gap-8">
					<h2 className="font-mono text-lg font-bold text-text-primary">
						<span className="text-accent-green">{"// "}</span>
						{"badges"}
					</h2>

					<div className="flex items-center gap-8">
						<Badge variant="critical">critical_issue</Badge>
						<Badge variant="warning">needs_review</Badge>
						<Badge variant="good">looks_good</Badge>
					</div>
				</section>

				{/* Toggle */}
				<section className="flex flex-col gap-8">
					<h2 className="font-mono text-lg font-bold text-text-primary">
						<span className="text-accent-green">{"// "}</span>
						{"toggle"}
					</h2>

					<div className="flex flex-col gap-4">
						<Toggle>
							<ToggleLabel>Dark mode</ToggleLabel>
						</Toggle>
						<Toggle defaultChecked>
							<ToggleLabel>Auto-roast on save</ToggleLabel>
						</Toggle>
						<Toggle />
					</div>
				</section>

				{/* Card */}
				<section className="flex flex-col gap-8">
					<h2 className="font-mono text-lg font-bold text-text-primary">
						<span className="text-accent-green">{"// "}</span>
						{"card"}
					</h2>

					<div className="flex gap-6">
						<Card className="flex-1">
							<CardTitle>roast_summary</CardTitle>
							<CardDescription>
								Your code has been analyzed. Results are in.
							</CardDescription>
						</Card>
						<Card className="flex-1">
							<CardTitle>metrics</CardTitle>
							<CardDescription>Complexity: High</CardDescription>
							<CardDescription>Readability: Low</CardDescription>
						</Card>
					</div>
				</section>

				{/* CodeBlock */}
				<section className="flex flex-col gap-8">
					<h2 className="font-mono text-lg font-bold text-text-primary">
						<span className="text-accent-green">{"// "}</span>
						{"code_block"}
					</h2>

					<CodeBlock>
						<CodeBlockHeader>roast.ts</CodeBlockHeader>
						<CodeBlockBody code={sampleCode} language="typescript" />
					</CodeBlock>
				</section>

				{/* DiffLine */}
				<section className="flex flex-col gap-8">
					<h2 className="font-mono text-lg font-bold text-text-primary">
						<span className="text-accent-green">{"// "}</span>
						{"diff_lines"}
					</h2>

					<div className="overflow-hidden border border-border-primary">
						<DiffLine type="context">
							{"function processData(input: any) {"}
						</DiffLine>
						<DiffLine type="removed">{"  console.log(input);"}</DiffLine>
						<DiffLine type="added">
							{"  logger.debug('Processing:', input);"}
						</DiffLine>
						<DiffLine type="context">
							{"  const result = transform(input);"}
						</DiffLine>
						<DiffLine type="removed">{"  return result;"}</DiffLine>
						<DiffLine type="added">{"  return sanitize(result);"}</DiffLine>
						<DiffLine type="context">{"}"}</DiffLine>
					</div>
				</section>

				{/* ScoreRing */}
				<section className="flex flex-col gap-8">
					<h2 className="font-mono text-lg font-bold text-text-primary">
						<span className="text-accent-green">{"// "}</span>
						{"score_ring"}
					</h2>

					<div className="flex items-center gap-12">
						<div className="flex flex-col items-center gap-3">
							<ScoreRing score={3} />
							<p className="font-mono text-xs text-text-tertiary">score=3</p>
						</div>
						<div className="flex flex-col items-center gap-3">
							<ScoreRing score={7} />
							<p className="font-mono text-xs text-text-tertiary">score=7</p>
						</div>
						<div className="flex flex-col items-center gap-3">
							<ScoreRing score={10} />
							<p className="font-mono text-xs text-text-tertiary">score=10</p>
						</div>
					</div>
				</section>
			</div>
		</div>
	);
}
