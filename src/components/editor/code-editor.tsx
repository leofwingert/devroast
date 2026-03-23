"use client";

import { type ChangeEvent, useCallback, useEffect } from "react";
import { tv } from "tailwind-variants";
import type { LanguageKey } from "./languages";
import { useHighlighter } from "./use-highlighter";
import { useLanguageDetect } from "./use-language-detect";

const editorVariants = tv({
	slots: {
		wrapper: "relative grid min-w-0 self-start",
		highlight: [
			"pointer-events-none [grid-area:1/1]",
			"whitespace-pre font-mono text-xs leading-6",
			"p-4",
			// Strip Shiki wrapper styles so it inherits our layout
			"[&_pre]:!m-0 [&_pre]:!bg-transparent [&_pre]:!p-0",
			"[&_pre]:whitespace-pre [&_pre]:font-mono [&_pre]:text-xs [&_pre]:leading-6",
			"[&_code]:!font-mono [&_code]:!text-xs [&_code]:!leading-6",
		],
		textarea: [
			"[grid-area:1/1] w-full resize-none overflow-hidden bg-transparent",
			"whitespace-pre font-mono text-xs leading-6 caret-text-primary",
			"p-4 outline-none",
			"placeholder:text-text-tertiary",
		],
	},
	variants: {
		ready: {
			true: { textarea: "text-transparent" },
			false: { textarea: "text-text-primary" },
		},
	},
	defaultVariants: {
		ready: false,
	},
});

type CodeEditorProps = {
	value: string;
	onChange: (code: string) => void;
	language?: LanguageKey | null;
	onLanguageDetected?: (language: LanguageKey | null) => void;
	placeholder?: string;
	className?: string;
};

/**
 * Code editor with syntax highlighting.
 * Transparent textarea overlaid on Shiki-highlighted code.
 * Scroll is delegated to the parent container — content grows to full size.
 */
function CodeEditor({
	value,
	onChange,
	language = null,
	onLanguageDetected,
	placeholder,
	className,
}: CodeEditorProps) {
	const { highlighter, highlight, loadLanguage } = useHighlighter();
	const { detectedLanguage } = useLanguageDetect(value);

	// Notify parent when detected language changes
	useEffect(() => {
		onLanguageDetected?.(detectedLanguage);
	}, [detectedLanguage, onLanguageDetected]);

	// Resolved language: manual override > auto-detect
	const resolvedLanguage = language ?? detectedLanguage;

	// Load language into Shiki when it changes
	useEffect(() => {
		if (resolvedLanguage) {
			loadLanguage(resolvedLanguage);
		}
	}, [resolvedLanguage, loadLanguage]);

	// Generate highlighted HTML on each render so async language loads repaint immediately.
	const highlightedHtml =
		highlighter && value ? highlight(value, resolvedLanguage) : "";

	const handleChange = useCallback(
		(e: ChangeEvent<HTMLTextAreaElement>) => {
			onChange(e.target.value);
		},
		[onChange],
	);

	// Highlight is ready when we have HTML to show
	const ready = !!highlightedHtml;
	const styles = editorVariants({ ready });

	return (
		<div className={styles.wrapper({ className })}>
			<div
				className={styles.highlight()}
				aria-hidden="true"
				dangerouslySetInnerHTML={
					highlightedHtml ? { __html: highlightedHtml } : undefined
				}
			/>
			<textarea
				value={value}
				onChange={handleChange}
				spellCheck={false}
				autoCapitalize="off"
				autoComplete="off"
				autoCorrect="off"
				className={styles.textarea()}
				placeholder={placeholder}
			/>
		</div>
	);
}

export { CodeEditor, type CodeEditorProps };
