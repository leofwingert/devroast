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
 * Initializes once with preloaded languages, then can load more on demand.
 */
function useHighlighter() {
	const [isLoading, setIsLoading] = useState(!highlighterInstance);
	const [highlighter, setHighlighter] = useState<ShikiHighlighter | null>(
		highlighterInstance,
	);
	const [, setLoadedLangsVersion] = useState(0);
	const loadedLangsRef = useRef<Set<string>>(
		new Set(PRELOADED_LANGUAGES.map((key) => LANGUAGES[key].shiki)),
	);

	useEffect(() => {
		if (highlighterInstance) {
			setHighlighter(highlighterInstance);
			setIsLoading(false);
			return;
		}

		let cancelled = false;
		getHighlighter().then((instance) => {
			if (!cancelled) {
				setHighlighter(instance);
				setIsLoading(false);
			}
		});

		return () => {
			cancelled = true;
		};
	}, []);

	const loadLanguage = useCallback(
		async (langKey: LanguageKey) => {
			if (!highlighter) return;

			const shikiLang = LANGUAGES[langKey]?.shiki;
			if (!shikiLang || loadedLangsRef.current.has(shikiLang)) return;

			try {
				await highlighter.loadLanguage(shikiLang as BundledLanguage);
				loadedLangsRef.current.add(shikiLang);
				setLoadedLangsVersion((version) => version + 1);
			} catch {
				// Language not available in shiki/bundle/web — fall back to plaintext
			}
		},
		[highlighter],
	);

	const highlight = useCallback(
		(code: string, langKey: LanguageKey | null): string => {
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
		[highlighter],
	);

	return {
		highlighter,
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
