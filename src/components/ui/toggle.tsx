"use client";

import { Switch } from "@base-ui/react/switch";
import type { ComponentProps } from "react";

type ToggleProps = ComponentProps<typeof Switch.Root> & {
	label?: string;
	className?: string;
};

function Toggle({ label, className, ...props }: ToggleProps) {
	return (
		// biome-ignore lint/a11y/noLabelWithoutControl: Base UI Switch.Root renders an <input> internally
		<label className={`inline-flex items-center gap-3 ${className ?? ""}`}>
			<Switch.Root
				className="group flex h-[22px] w-10 cursor-pointer items-center rounded-[11px] bg-border-primary p-[3px] transition-colors data-[checked]:bg-accent-green"
				{...props}
			>
				<Switch.Thumb className="h-4 w-4 rounded-full bg-[#6B7280] transition-transform data-[checked]:translate-x-[18px] data-[checked]:bg-[#0A0A0A]" />
			</Switch.Root>
			{label && (
				<span className="font-mono text-xs text-text-secondary group-has-[[data-checked]]:text-accent-green">
					{label}
				</span>
			)}
		</label>
	);
}

export { Toggle, type ToggleProps };
