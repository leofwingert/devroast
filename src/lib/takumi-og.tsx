import { ImageResponse } from "@takumi-rs/image-response";

export function RoastOGTemplate({
	score,
	language,
	lineCount,
	roastComment,
}: {
	score: string;
	language: string;
	lineCount: number;
	roastComment: string;
}) {
	return (
		<ImageResponse
			style={{
				display: "flex",
				flexDirection: "column",
				backgroundColor: "#0a0a0a",
				width: "100%",
				height: "100%",
				padding: "48px",
			}}
		>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					justifyContent: "space-between",
					height: "100%",
				}}
			>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						gap: "24px",
					}}
				>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: "16px",
						}}
					>
						<span
							style={{
								fontSize: "48px",
								fontWeight: 700,
								color: "#ef4444",
								fontFamily: "monospace",
							}}
						>
							{score}/10
						</span>
						<span
							style={{
								fontSize: "24px",
								color: "#a1a1aa",
								fontFamily: "monospace",
							}}
						>
							DevRoast
						</span>
					</div>

					<div
						style={{
							display: "flex",
							flexDirection: "column",
							gap: "8px",
						}}
					>
						<span
							style={{
								fontSize: "28px",
								color: "#fafafa",
								fontFamily: "sans-serif",
								lineHeight: 1.4,
							}}
						>
							{roastComment.slice(0, 120)}
							{roastComment.length > 120 ? "..." : ""}
						</span>
					</div>
				</div>

				<div
					style={{
						display: "flex",
						gap: "24px",
						alignItems: "center",
					}}
				>
					<span
						style={{
							fontSize: "18px",
							color: "#71717a",
							fontFamily: "monospace",
						}}
					>
						{language}
					</span>
					<span
						style={{
							fontSize: "18px",
							color: "#71717a",
							fontFamily: "monospace",
						}}
					>
						{lineCount} lines
					</span>
				</div>
			</div>
		</ImageResponse>
	);
}
