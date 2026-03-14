"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
	BundledLanguage,
	BundledTheme,
	HighlighterGeneric,
} from "shiki/bundle/web";
import { LANGUAGES, type LanguageKey, PRELOADED_LANGUAGES } from "./languages";

type ShikiHighlighter = HighlighterGeneric<BundledLanguage, BundledTheme>;

/** Module-level singleton so multiple components share one instance */
let highlighterInstance: ShikiHighlighter | null = null;
let highlighterPromise: Promise<ShikiHighlighter> | null = null;

async function getHighlighter(): Promise<ShikiHighlighter> {
	if (highlighterInstance) return highlighterInstance;
	if (highlighterPromise) return highlighterPromise;

	highlighterPromise = import("shiki/bundle/web").then(
		async ({ createHighlighter }) => {
			const instance = await createHighlighter({
				themes: ["vesper"],
				langs: PRELOADED_LANGUAGES.map(
					(key) => LANGUAGES[key].shiki as BundledLanguage,
				),
			});
			highlighterInstance = instance;
			return instance;
		},
	);

	return highlighterPromise;
}

/**
 * Hook that provides a singleton Shiki highlighter instance.
 * Uses refs to always access the latest highlighter without re-renders.
 */
function useHighlighter() {
	const [isLoading, setIsLoading] = useState(!highlighterInstance);
	const highlighterRef = useRef<ShikiHighlighter | null>(highlighterInstance);
	const [, forceUpdate] = useState(0);

	const loadedLangsRef = useRef<Set<string>>(
		new Set(PRELOADED_LANGUAGES.map((key) => LANGUAGES[key].shiki)),
	);

	useEffect(() => {
		if (highlighterInstance) {
			highlighterRef.current = highlighterInstance;
			setIsLoading(false);
			return;
		}

		let cancelled = false;
		getHighlighter().then((instance) => {
			if (!cancelled) {
				highlighterRef.current = instance;
				setIsLoading(false);
				forceUpdate((n) => n + 1); // Force re-render after highlighter loads
			}
		});

		return () => {
			cancelled = true;
		};
	}, []);

	const loadLanguage = useCallback(async (langKey: LanguageKey) => {
		const highlighter = highlighterRef.current;
		if (!highlighter) return;

		const shikiLang = LANGUAGES[langKey]?.shiki;
		if (!shikiLang || loadedLangsRef.current.has(shikiLang)) return;

		try {
			await highlighter.loadLanguage(shikiLang as BundledLanguage);
			loadedLangsRef.current.add(shikiLang);
		} catch {
			// Language not available in shiki/bundle/web — fall back to plaintext
		}
	}, []);

	const highlight = useCallback(
		(code: string, langKey: LanguageKey | null): string => {
			const highlighter = highlighterRef.current;
			if (!highlighter) return escapeHtml(code);

			const shikiLang = langKey ? LANGUAGES[langKey]?.shiki : null;
			const lang =
				shikiLang && loadedLangsRef.current.has(shikiLang)
					? shikiLang
					: "plaintext";

			try {
				return highlighter.codeToHtml(code, {
					lang,
					theme: "vesper",
				});
			} catch {
				return escapeHtml(code);
			}
		},
		[],
	);

	// Return both the ref value (for logic) and a getter for the current value
	return {
		highlighter: highlighterRef.current,
		isLoading,
		loadLanguage,
		highlight,
	};
}

function escapeHtml(text: string): string {
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}

export { useHighlighter };
