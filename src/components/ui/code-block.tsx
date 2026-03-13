import type { BundledLanguage } from "shiki";
import { codeToHtml } from "shiki";

type CodeBlockProps = {
	code: string;
	language: BundledLanguage;
	filename?: string;
	className?: string;
};

async function CodeBlock({
	code,
	language,
	filename,
	className,
}: CodeBlockProps) {
	const html = await codeToHtml(code, {
		lang: language,
		theme: "vesper",
	});

	const lines = code.split("\n");

	return (
		<div
			className={`overflow-hidden border border-border-primary bg-bg-input ${className ?? ""}`}
		>
			{/* Header */}
			<div className="flex h-10 items-center gap-2 border-b border-border-primary px-4">
				<span className="inline-block h-2.5 w-2.5 rounded-full bg-accent-red" />
				<span className="inline-block h-2.5 w-2.5 rounded-full bg-accent-amber" />
				<span className="inline-block h-2.5 w-2.5 rounded-full bg-accent-green" />
				{filename && (
					<span className="ml-auto font-mono text-xs text-text-tertiary">
						{filename}
					</span>
				)}
			</div>

			{/* Body */}
			<div className="flex">
				{/* Line numbers */}
				<div className="flex flex-col border-r border-border-primary bg-bg-surface px-2.5 py-3">
					{lines.map((_, i) => (
						<span
							key={`ln-${
								// biome-ignore lint/suspicious/noArrayIndexKey: line numbers are stable
								i
							}`}
							className="text-right font-mono text-[13px] leading-6 text-text-tertiary"
						>
							{i + 1}
						</span>
					))}
				</div>

				{/* Code */}
				<div
					className="flex-1 overflow-x-auto p-3 font-mono text-[13px] leading-6 [&_pre]:!bg-transparent [&_code]:!bg-transparent"
					dangerouslySetInnerHTML={{ __html: html }}
				/>
			</div>
		</div>
	);
}

export { CodeBlock, type CodeBlockProps };
