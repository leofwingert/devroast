import { tv } from "tailwind-variants";

const cardVariants = tv({
	base: "flex flex-col gap-3 border border-border-primary p-5",
});

const cardTitleVariants = tv({
	base: "font-mono text-sm font-bold text-text-primary",
});

const cardDescriptionVariants = tv({
	base: "font-mono text-xs text-text-secondary",
});

type CardProps = React.ComponentProps<"div"> & {
	className?: string;
};

type CardTitleProps = React.ComponentProps<"p"> & {
	className?: string;
};

type CardDescriptionProps = React.ComponentProps<"p"> & {
	className?: string;
};

function Card({ className, children, ...props }: CardProps) {
	return (
		<div className={cardVariants({ className })} {...props}>
			{children}
		</div>
	);
}

function CardTitle({ className, children, ...props }: CardTitleProps) {
	return (
		<p className={cardTitleVariants({ className })} {...props}>
			{children}
		</p>
	);
}

function CardDescription({
	className,
	children,
	...props
}: CardDescriptionProps) {
	return (
		<p className={cardDescriptionVariants({ className })} {...props}>
			{children}
		</p>
	);
}

export {
	Card,
	CardDescription,
	type CardDescriptionProps,
	type CardProps,
	CardTitle,
	type CardTitleProps,
	cardDescriptionVariants,
	cardTitleVariants,
	cardVariants,
};
