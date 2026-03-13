import { tv, type VariantProps } from "tailwind-variants";

const badgeVariants = tv({
	base: "inline-flex items-center gap-2 font-mono text-xs",
	variants: {
		variant: {
			critical: "text-accent-red",
			warning: "text-accent-amber",
			good: "text-accent-green",
		},
	},
	defaultVariants: {
		variant: "critical",
	},
});

type BadgeVariants = VariantProps<typeof badgeVariants>;

type BadgeProps = React.ComponentProps<"span"> &
	BadgeVariants & {
		className?: string;
	};

function Badge({ variant, className, children, ...props }: BadgeProps) {
	return (
		<span className={badgeVariants({ variant, className })} {...props}>
			<span className="inline-block h-2 w-2 rounded-full bg-current" />
			{children}
		</span>
	);
}

export { Badge, type BadgeProps, type BadgeVariants, badgeVariants };
