import type { BundledLanguage } from "shiki";
import { codeToHtml } from "shiki";
import { tv } from "tailwind-variants";

const codeBlockVariants = tv({
	base: "overflow-hidden border border-border-primary bg-bg-input",
});

const codeBlockHeaderVariants = tv({
	base: "flex h-10 items-center gap-2 border-b border-border-primary px-4",
});

type CodeBlockProps = React.ComponentProps<"div"> & {
	className?: string;
};

type CodeBlockHeaderProps = React.ComponentProps<"div"> & {
	className?: string;
};

type CodeBlockBodyProps = {
	code: string;
	language: BundledLanguage;
	className?: string;
};

function CodeBlock({ className, children, ...props }: CodeBlockProps) {
	return (
		<div className={codeBlockVariants({ className })} {...props}>
			{children}
		</div>
	);
}

function CodeBlockHeader({
	className,
	children,
	...props
}: CodeBlockHeaderProps) {
	return (
		<div className={codeBlockHeaderVariants({ className })} {...props}>
			{children}
		</div>
	);
}

async function CodeBlockBody({
	code,
	language,
	className,
}: CodeBlockBodyProps) {
	const html = await codeToHtml(code, {
		lang: language,
		theme: "vesper",
	});

	const lines = code.split("\n");

	return (
		<div className={`flex ${className ?? ""}`}>
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
	);
}

export {
	CodeBlock,
	CodeBlockBody,
	type CodeBlockBodyProps,
	CodeBlockHeader,
	type CodeBlockHeaderProps,
	type CodeBlockProps,
	codeBlockHeaderVariants,
	codeBlockVariants,
};
