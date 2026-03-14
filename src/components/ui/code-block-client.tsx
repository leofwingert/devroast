"use client";

import { useEffect, useState } from "react";
import type { Highlighter } from "shiki";
import { tv } from "tailwind-variants";

// ---------------------------------------------------------------------------
// Singleton highlighter — created once, reused across all instances
// ---------------------------------------------------------------------------

let highlighterPromise: Promise<Highlighter> | null = null;

async function getOrCreateHighlighter(): Promise<Highlighter> {
	if (!highlighterPromise) {
		highlighterPromise = import("shiki").then((mod) =>
			mod.createHighlighter({
				themes: ["vesper"],
				langs: [
					"javascript",
					"typescript",
					"python",
					"java",
					"sql",
					"html",
					"css",
					"rust",
					"go",
					"c",
					"cpp",
					"csharp",
					"ruby",
					"php",
					"swift",
					"kotlin",
					"bash",
					"json",
					"yaml",
					"markdown",
				],
			}),
		);
	}
	return highlighterPromise;
}

// ---------------------------------------------------------------------------
// Variants
// ---------------------------------------------------------------------------

const codeBlockBodyClientVariants = tv({
	base: "flex",
});

const lineNumbersVariants = tv({
	base: "flex flex-col border-r border-border-primary bg-bg-surface px-2.5 py-3",
});

const lineNumberVariants = tv({
	base: "text-right font-mono text-[13px] leading-6 text-text-tertiary",
});

const codeAreaVariants = tv({
	base: "flex-1 overflow-x-auto p-3 font-mono text-[13px] leading-6 [&_pre]:!bg-transparent [&_code]:!bg-transparent",
});

const fallbackCodeVariants = tv({
	base: "whitespace-pre font-mono text-[13px] leading-6 text-text-primary",
});

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type CodeBlockBodyClientProps = {
	code: string;
	language: string;
	className?: string;
};

function CodeBlockBodyClient({
	code,
	language,
	className,
}: CodeBlockBodyClientProps) {
	const [html, setHtml] = useState<string | null>(null);
	const lines = code.split("\n");

	useEffect(() => {
		let cancelled = false;

		getOrCreateHighlighter()
			.then(async (highlighter) => {
				// Load the language on-demand if it wasn't in the initial set
				const loadedLangs = highlighter.getLoadedLanguages();
				if (!loadedLangs.includes(language)) {
					try {
						await highlighter.loadLanguage(
							language as Parameters<typeof highlighter.loadLanguage>[0],
						);
					} catch {
						// Unknown language — fall back to plaintext
					}
				}
				return highlighter;
			})
			.then((highlighter) => {
				if (cancelled) return;
				const loadedLangs = highlighter.getLoadedLanguages();
				const lang = loadedLangs.includes(language) ? language : "plaintext";
				const result = highlighter.codeToHtml(code, {
					lang,
					theme: "vesper",
				});
				setHtml(result);
			})
			.catch(() => {
				// Shiki init failed entirely — leave fallback rendering
			});

		return () => {
			cancelled = true;
		};
	}, [code, language]);

	return (
		<div className={codeBlockBodyClientVariants({ className })}>
			{/* Line numbers */}
			<div className={lineNumbersVariants()}>
				{lines.map((_, i) => (
					<span
						key={`ln-${
							// biome-ignore lint/suspicious/noArrayIndexKey: line numbers are stable
							i
						}`}
						className={lineNumberVariants()}
					>
						{i + 1}
					</span>
				))}
			</div>

			{/* Code — highlighted or plaintext fallback */}
			{html ? (
				<div
					className={codeAreaVariants()}
					dangerouslySetInnerHTML={{ __html: html }}
				/>
			) : (
				<div className={codeAreaVariants()}>
					<pre className={fallbackCodeVariants()}>{code}</pre>
				</div>
			)}
		</div>
	);
}

export {
	CodeBlockBodyClient,
	type CodeBlockBodyClientProps,
	codeBlockBodyClientVariants,
};
