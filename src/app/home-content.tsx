"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { useFormStatus } from "react-dom";
import { createRoast } from "@/app/actions";
import { CodeEditor } from "@/components/editor/code-editor";
import { LanguageSelector } from "@/components/editor/language-selector";
import type { LanguageKey } from "@/components/editor/languages";
import { Button } from "@/components/ui/button";
import { Toggle, ToggleLabel } from "@/components/ui/toggle";

const MAX_CODE_LENGTH = 2000;

function SubmitButton({ disabled }: { disabled: boolean }) {
	const { pending } = useFormStatus();
	return (
		<Button variant="primary" size="md" disabled={disabled || pending}>
			{pending ? "$ roasting..." : "$ roast_my_code"}
		</Button>
	);
}

const sampleCode = `function calculateTotal(items) {
  var total = 0;
  for (var i = 0; i < items.length; i++) {
    total = total + items[i].price;
  }

  if (total > 100) {
    console.log("discount applied");
    total = total - 5;
  }

  // TODO: handle tax calculation
  // TODO: handle currency conversion

  return total;
}`;

function LineNumbers({ count }: { count: number }) {
	return (
		<div className="sticky left-0 z-10 flex flex-col border-r border-border-primary bg-bg-surface px-3 py-4">
			{Array.from({ length: count }, (_, i) => (
				<span
					key={`ln-${
						// biome-ignore lint/suspicious/noArrayIndexKey: line numbers are stable
						i
					}`}
					className="text-right font-mono text-xs leading-6 text-text-tertiary"
				>
					{i + 1}
				</span>
			))}
		</div>
	);
}

type HomeContentProps = {
	statsSlot: React.ReactNode;
	leaderboardSlot: React.ReactNode;
};

function HomeContent({ statsSlot, leaderboardSlot }: HomeContentProps) {
	const [code, setCode] = useState(sampleCode);
	const [selectedLanguage, setSelectedLanguage] = useState<LanguageKey | null>(
		null,
	);
	const [detectedLanguage, setDetectedLanguage] = useState<LanguageKey | null>(
		null,
	);
	const [roastMode, setRoastMode] = useState(true);
	const lines = code.split("\n");
	const charCount = code.length;
	const isOverLimit = charCount > MAX_CODE_LENGTH;
	const isEmpty = code.trim().length === 0;

	const handleLanguageDetected = useCallback((lang: LanguageKey | null) => {
		setDetectedLanguage(lang);
	}, []);

	return (
		<main className="flex w-full flex-col items-center">
			{/* Hero Section */}
			<section className="flex w-full max-w-[780px] flex-col items-center gap-3 px-10 pt-20">
				<div className="flex items-center gap-3">
					<span className="font-mono text-4xl font-bold text-accent-green">
						$
					</span>
					<h1 className="font-mono text-4xl font-bold text-text-primary">
						paste your code. get roasted.
					</h1>
				</div>
				<p className="font-mono text-sm text-text-secondary">
					{
						"// drop your code below and we'll rate it — brutally honest or full roast mode"
					}
				</p>
			</section>

			{/* Code Editor */}
			<section className="mt-8 w-full max-w-[780px] overflow-hidden border border-border-primary bg-bg-input">
				{/* macOS Window Header */}
				<div className="flex h-10 items-center gap-2 border-b border-border-primary px-4">
					<span className="inline-block h-3 w-3 rounded-full bg-accent-red" />
					<span className="inline-block h-3 w-3 rounded-full bg-accent-amber" />
					<span className="inline-block h-3 w-3 rounded-full bg-accent-green" />
				</div>

				{/* Editor Body */}
				<div className="flex max-h-80 overflow-auto">
					<LineNumbers count={lines.length} />
					<CodeEditor
						value={code}
						onChange={setCode}
						language={selectedLanguage}
						onLanguageDetected={handleLanguageDetected}
						placeholder="// paste your code here..."
						className="flex-1"
					/>
				</div>

				{/* Character Counter */}
				<div className="flex items-center justify-end border-t border-border-primary px-4 py-1.5">
					<span
						className={`font-mono text-xs ${isOverLimit ? "text-accent-red" : "text-text-tertiary"}`}
					>
						{charCount.toLocaleString()}/{MAX_CODE_LENGTH.toLocaleString()}
					</span>
				</div>
			</section>

			{/* Actions Bar */}
			<section className="mt-4 flex w-full max-w-[780px] items-center justify-between">
				<div className="flex items-center gap-4">
					<Toggle checked={roastMode} onCheckedChange={setRoastMode}>
						<ToggleLabel>roast mode</ToggleLabel>
					</Toggle>
					<span className="font-mono text-xs text-text-tertiary">
						{roastMode
							? "// maximum sarcasm enabled"
							: "// constructive feedback"}
					</span>
				</div>
				<div className="flex items-center gap-3">
					<LanguageSelector
						detectedLanguage={detectedLanguage}
						selectedLanguage={selectedLanguage}
						onSelect={setSelectedLanguage}
					/>
					<form action={createRoast}>
						<input type="hidden" name="code" value={code} />
						<input
							type="hidden"
							name="language"
							value={selectedLanguage ?? ""}
						/>
						<input
							type="hidden"
							name="roastMode"
							value={roastMode ? "true" : "false"}
						/>
						<SubmitButton disabled={isEmpty || isOverLimit} />
					</form>
				</div>
			</section>

			{/* Footer Stats */}
			<section className="mt-8">{statsSlot}</section>

			{/* Spacer */}
			<div className="h-15" />

			{/* Leaderboard Preview */}
			<section className="mt-8 flex w-full max-w-[960px] flex-col gap-6">
				{/* Title Row */}
				<div className="flex items-center justify-between">
					<div className="flex flex-col gap-2">
						<div className="flex items-center gap-2">
							<span className="font-mono text-sm font-bold text-accent-green">
								{"//"}
							</span>
							<span className="font-mono text-sm font-bold text-text-primary">
								shame_leaderboard
							</span>
						</div>
						<p className="font-mono text-[13px] text-text-tertiary">
							{"// the worst code on the internet, ranked by shame"}
						</p>
					</div>
					<Link
						href="/leaderboard"
						className="border border-border-primary px-3 py-1.5 font-mono text-xs text-text-secondary transition-colors hover:text-text-primary"
					>
						{"$ view_all >>"}
					</Link>
				</div>

				{/* Leaderboard Table + Footer (server-prefetched, Suspense) */}
				{leaderboardSlot}
			</section>
		</main>
	);
}

export { HomeContent, type HomeContentProps };
