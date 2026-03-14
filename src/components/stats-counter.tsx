"use client";

import NumberFlow from "@number-flow/react";
import { useEffect, useRef, useState } from "react";
import { tv } from "tailwind-variants";
import type { Stats } from "@/lib/get-cached-data";

const statsCounterVariants = tv({
	base: "flex items-center justify-center gap-6",
});

const statTextVariants = tv({
	base: "font-mono text-xs text-text-tertiary",
});

type StatsCounterProps = {
	stats: Stats;
	className?: string;
};

function StatsCounter({ stats, className }: StatsCounterProps) {
	const ref = useRef<HTMLDivElement>(null);
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setVisible(true);
					observer.disconnect();
				}
			},
			{ threshold: 0.5 },
		);

		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	const totalRoasts = visible ? stats.totalRoasts : 0;
	const avgScore = visible ? stats.avgScore : 0;

	return (
		<div ref={ref} className={statsCounterVariants({ className })}>
			<span className={statTextVariants()}>
				<NumberFlow value={totalRoasts} /> codes roasted
			</span>
			<span className={statTextVariants()}>·</span>
			<span className={statTextVariants()}>
				avg score:{" "}
				<NumberFlow
					value={avgScore}
					format={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }}
				/>
				/10
			</span>
		</div>
	);
}

export { StatsCounter };
