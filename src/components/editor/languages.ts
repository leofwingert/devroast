/**
 * Central language map for Shiki highlighting and highlight.js detection.
 * Keys are the canonical language IDs used throughout the editor.
 */

type LanguageEntry = {
	readonly label: string;
	readonly shiki: string;
	readonly hljs: string;
};

const LANGUAGES = {
	javascript: { label: "JavaScript", shiki: "javascript", hljs: "javascript" },
	typescript: { label: "TypeScript", shiki: "typescript", hljs: "typescript" },
	python: { label: "Python", shiki: "python", hljs: "python" },
	html: { label: "HTML", shiki: "html", hljs: "xml" },
	css: { label: "CSS", shiki: "css", hljs: "css" },
	json: { label: "JSON", shiki: "json", hljs: "json" },
	sql: { label: "SQL", shiki: "sql", hljs: "sql" },
	rust: { label: "Rust", shiki: "rust", hljs: "rust" },
	go: { label: "Go", shiki: "go", hljs: "go" },
	java: { label: "Java", shiki: "java", hljs: "java" },
	csharp: { label: "C#", shiki: "csharp", hljs: "csharp" },
	cpp: { label: "C++", shiki: "cpp", hljs: "cpp" },
	c: { label: "C", shiki: "c", hljs: "c" },
	php: { label: "PHP", shiki: "php", hljs: "php" },
	ruby: { label: "Ruby", shiki: "ruby", hljs: "ruby" },
	swift: { label: "Swift", shiki: "swift", hljs: "swift" },
	kotlin: { label: "Kotlin", shiki: "kotlin", hljs: "kotlin" },
	shell: { label: "Shell", shiki: "shellscript", hljs: "bash" },
	yaml: { label: "YAML", shiki: "yaml", hljs: "yaml" },
	markdown: { label: "Markdown", shiki: "markdown", hljs: "markdown" },
	jsx: { label: "JSX", shiki: "jsx", hljs: "javascript" },
	tsx: { label: "TSX", shiki: "tsx", hljs: "typescript" },
} as const satisfies Record<string, LanguageEntry>;

type LanguageKey = keyof typeof LANGUAGES;

/** Languages loaded eagerly when the highlighter initializes */
const PRELOADED_LANGUAGES: LanguageKey[] = [
	"javascript",
	"typescript",
	"python",
	"html",
	"css",
];

/**
 * Map from highlight.js language names to our canonical keys.
 * hljs sometimes returns names that differ from our keys.
 */
const HLJS_TO_KEY: Record<string, LanguageKey> = Object.fromEntries(
	Object.entries(LANGUAGES).flatMap(([key, entry]) => {
		const mappings: [string, LanguageKey][] = [
			[entry.hljs, key as LanguageKey],
		];
		// Also map the key itself if different from hljs
		if (key !== entry.hljs) {
			mappings.push([key, key as LanguageKey]);
		}
		return mappings;
	}),
);

/** Resolve a highlight.js language name to our canonical key */
function resolveHljsLanguage(hljsLang: string): LanguageKey | null {
	return HLJS_TO_KEY[hljsLang] ?? null;
}

export {
	LANGUAGES,
	type LanguageEntry,
	type LanguageKey,
	PRELOADED_LANGUAGES,
	resolveHljsLanguage,
};
