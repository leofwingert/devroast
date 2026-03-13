import { tv } from "tailwind-variants";

const cardVariants = tv({
	base: "flex flex-col gap-3 border border-border-primary p-5",
});

type CardProps = React.ComponentProps<"div"> & {
	className?: string;
};

function Card({ className, children, ...props }: CardProps) {
	return (
		<div className={cardVariants({ className })} {...props}>
			{children}
		</div>
	);
}

export { Card, type CardProps, cardVariants };
