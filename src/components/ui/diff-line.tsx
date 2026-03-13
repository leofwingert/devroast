import { tv, type VariantProps } from "tailwind-variants";

const diffLineVariants = tv({
	base: "flex items-center gap-2 px-4 py-2 font-mono text-[13px]",
	variants: {
		type: {
			added: "bg-[#0A1A0F] text-text-primary",
			removed: "bg-[#1A0A0A] text-text-secondary",
			context: "text-text-secondary",
		},
	},
	defaultVariants: {
		type: "context",
	},
});

const prefixMap = {
	added: "+",
	removed: "-",
	context: " ",
} as const;

const prefixColorMap = {
	added: "text-accent-green",
	removed: "text-accent-red",
	context: "text-text-tertiary",
} as const;

type DiffLineVariants = VariantProps<typeof diffLineVariants>;

type DiffLineProps = React.ComponentProps<"div"> &
	DiffLineVariants & {
		className?: string;
	};

function DiffLine({
	type = "context",
	className,
	children,
	...props
}: DiffLineProps) {
	const resolvedType = type ?? "context";

	return (
		<div className={diffLineVariants({ type, className })} {...props}>
			<span className={prefixColorMap[resolvedType]}>
				{prefixMap[resolvedType]}
			</span>
			<span>{children}</span>
		</div>
	);
}

export {
	DiffLine,
	type DiffLineProps,
	type DiffLineVariants,
	diffLineVariants,
};
