import { tv, type VariantProps } from "tailwind-variants";

const buttonVariants = tv({
	base: "inline-flex items-center justify-center font-mono font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus disabled:pointer-events-none disabled:opacity-50",
	variants: {
		variant: {
			primary:
				"bg-accent-green text-[#0A0A0A] hover:bg-accent-green/90 active:bg-accent-green/80",
			secondary:
				"border border-border-primary bg-transparent text-text-primary hover:bg-border-primary/50 active:bg-border-primary/70",
			ghost:
				"border border-border-primary bg-transparent text-text-secondary hover:text-text-primary hover:bg-border-primary/30 active:bg-border-primary/50",
			destructive:
				"bg-accent-red text-text-primary hover:bg-accent-red/90 active:bg-accent-red/80",
		},
		size: {
			sm: "px-3 py-1.5 text-xs",
			md: "px-4 py-2 text-sm",
			lg: "px-6 py-2.5 text-sm",
		},
	},
	defaultVariants: {
		variant: "primary",
		size: "md",
	},
});

type ButtonVariants = VariantProps<typeof buttonVariants>;

type ButtonProps = React.ComponentProps<"button"> &
	ButtonVariants & {
		className?: string;
	};

function Button({ variant, size, className, ...props }: ButtonProps) {
	return (
		<button
			className={buttonVariants({ variant, size, className })}
			{...props}
		/>
	);
}

export { Button, type ButtonProps, type ButtonVariants, buttonVariants };
