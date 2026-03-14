"use client";

import { Switch } from "@base-ui/react/switch";
import type { ComponentProps } from "react";
import { tv } from "tailwind-variants";

const toggleLabelVariants = tv({
	base: "font-mono text-xs text-text-secondary group-has-[[data-checked]]:text-accent-green",
});

type ToggleProps = ComponentProps<typeof Switch.Root> & {
	className?: string;
};

type ToggleLabelProps = React.ComponentProps<"span"> & {
	className?: string;
};

function Toggle({ className, children, ...props }: ToggleProps) {
	return (
		// biome-ignore lint/a11y/noLabelWithoutControl: Base UI Switch.Root renders an <input> internally
		<label
			className={`group inline-flex items-center gap-3 ${className ?? ""}`}
		>
			<Switch.Root
				className="flex h-[22px] w-10 cursor-pointer items-center rounded-[11px] bg-border-primary p-[3px] transition-colors data-[checked]:bg-accent-green"
				{...props}
			>
				<Switch.Thumb className="h-4 w-4 rounded-full bg-[#6B7280] transition-transform data-[checked]:translate-x-[18px] data-[checked]:bg-[#0A0A0A]" />
			</Switch.Root>
			{children}
		</label>
	);
}

function ToggleLabel({ className, children, ...props }: ToggleLabelProps) {
	return (
		<span className={toggleLabelVariants({ className })} {...props}>
			{children}
		</span>
	);
}

export {
	Toggle,
	ToggleLabel,
	type ToggleLabelProps,
	type ToggleProps,
	toggleLabelVariants,
};
