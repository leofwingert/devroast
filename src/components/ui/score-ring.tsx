import { tv } from "tailwind-variants";

const scoreRingVariants = tv({
	base: "relative inline-flex items-center justify-center",
});

type ScoreRingProps = {
	score: number;
	max?: number;
	className?: string;
};

function ScoreRing({ score, max = 10, className }: ScoreRingProps) {
	const size = 180;
	const strokeWidth = 4;
	const radius = (size - strokeWidth) / 2;
	const circumference = 2 * Math.PI * radius;
	const progress = Math.min(score / max, 1);
	const dashLength = circumference * progress;
	const dashGap = circumference - dashLength;

	return (
		<div
			className={scoreRingVariants({ className })}
			style={{ width: size, height: size }}
		>
			<svg
				width={size}
				height={size}
				viewBox={`0 0 ${size} ${size}`}
				className="absolute inset-0"
				aria-hidden="true"
			>
				<defs>
					<linearGradient id="score-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
						<stop offset="0%" stopColor="var(--color-accent-green)" />
						<stop offset="100%" stopColor="var(--color-accent-amber)" />
					</linearGradient>
				</defs>

				{/* Base track */}
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					fill="none"
					stroke="var(--color-border-primary)"
					strokeWidth={strokeWidth}
				/>

				{/* Progress arc */}
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					fill="none"
					stroke="url(#score-gradient)"
					strokeWidth={strokeWidth}
					strokeLinecap="round"
					strokeDasharray={`${dashLength} ${dashGap}`}
					strokeDashoffset={circumference * 0.25}
					className="transition-all duration-700 ease-out"
				/>
			</svg>

			{/* Center text */}
			<div className="flex items-baseline gap-0.5">
				<span className="font-mono text-[48px] font-bold leading-none text-text-primary">
					{score}
				</span>
				<span className="font-mono text-base leading-none text-text-tertiary">
					/{max}
				</span>
			</div>
		</div>
	);
}

export { ScoreRing, type ScoreRingProps, scoreRingVariants };
