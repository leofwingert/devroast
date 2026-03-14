"use client";

import { tv } from "tailwind-variants";
import { LANGUAGES, type LanguageKey } from "./languages";

const selectorVariants = tv({
	slots: {
		wrapper: "relative",
		select: [
			"appearance-none bg-bg-surface",
			"border border-border-primary px-3 py-1.5",
			"font-mono text-xs text-text-primary",
			"outline-none transition-colors",
			"enabled:hover:border-border-focus",
			"focus-visible:border-border-focus",
			"cursor-pointer",
			"pr-7",
		],
		chevron: [
			"pointer-events-none absolute right-2 top-1/2 -translate-y-1/2",
			"font-mono text-xs text-text-tertiary",
		],
	},
});

type LanguageSelectorProps = {
	detectedLanguage: LanguageKey | null;
	selectedLanguage: LanguageKey | null;
	onSelect: (language: LanguageKey | null) => void;
	className?: string;
};

const languageEntries = Object.entries(LANGUAGES) as [
	LanguageKey,
	(typeof LANGUAGES)[LanguageKey],
][];

/**
 * Dropdown for manual language selection.
 * Shows auto-detected language as default, allows override.
 */
function LanguageSelector({
	detectedLanguage,
	selectedLanguage,
	onSelect,
	className,
}: LanguageSelectorProps) {
	const styles = selectorVariants();

	const autoLabel = detectedLanguage
		? `auto: ${LANGUAGES[detectedLanguage].label}`
		: "auto-detect";

	return (
		<div className={styles.wrapper({ className })}>
			<select
				className={styles.select()}
				value={selectedLanguage ?? ""}
				onChange={(e) => {
					const val = e.target.value;
					onSelect(val ? (val as LanguageKey) : null);
				}}
			>
				<option value="">{autoLabel}</option>
				{languageEntries.map(([key, entry]) => (
					<option key={key} value={key}>
						{entry.label}
					</option>
				))}
			</select>
			<span className={styles.chevron()} aria-hidden="true">
				v
			</span>
		</div>
	);
}

export { LanguageSelector, type LanguageSelectorProps };
