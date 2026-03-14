"use client";

import { useEffect, useRef, useState } from "react";
import { type LanguageKey, resolveHljsLanguage } from "./languages";

const DEBOUNCE_MS = 150;

/**
 * Hook that auto-detects the language of code using highlight.js.
 * Debounces detection to avoid running on every keystroke.
 */
function useLanguageDetect(code: string) {
	const [detectedLanguage, setDetectedLanguage] = useState<LanguageKey | null>(
		null,
	);
	const [isDetecting, setIsDetecting] = useState(false);
	const hljsRef = useRef<
		typeof import("highlight.js/lib/common").default | null
	>(null);
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	// Lazy-load highlight.js on first render
	useEffect(() => {
		let cancelled = false;

		import("highlight.js/lib/common").then((mod) => {
			if (!cancelled) {
				hljsRef.current = mod.default;
			}
		});

		return () => {
			cancelled = true;
		};
	}, []);

	// Debounced detection
	useEffect(() => {
		if (!code.trim()) {
			setDetectedLanguage(null);
			return;
		}

		setIsDetecting(true);

		if (timerRef.current) {
			clearTimeout(timerRef.current);
		}

		timerRef.current = setTimeout(() => {
			const hljs = hljsRef.current;
			if (!hljs) {
				setIsDetecting(false);
				return;
			}

			try {
				const result = hljs.highlightAuto(code);
				const lang = result.language
					? resolveHljsLanguage(result.language)
					: null;
				setDetectedLanguage(lang);
			} catch {
				setDetectedLanguage(null);
			}
			setIsDetecting(false);
		}, DEBOUNCE_MS);

		return () => {
			if (timerRef.current) {
				clearTimeout(timerRef.current);
			}
		};
	}, [code]);

	return { detectedLanguage, isDetecting };
}

export { useLanguageDetect };
