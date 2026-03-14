/** @jsxImportSource react */
import type { ReactNode } from "react";

interface RoastOGProps {
	score: string;
	language: string;
	lineCount: number;
	roastComment: string;
}

const colors = {
	bgPage: "#0a0a0a",
	textPrimary: "#fafafa",
	textTertiary: "#71717a",
	accentAmber: "#f59e0b",
	accentRed: "#ef4444",
};

function truncateText(text: string, maxLength: number): string {
	if (text.length <= maxLength) return text;
	return text.slice(0, maxLength - 3).trim() + "...";
}

export function RoastOGTemplate({
	score,
	language,
	lineCount,
	roastComment,
}: RoastOGProps): ReactNode {
	const truncatedComment = truncateText(roastComment, 120);

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				justifyContent: "space-between",
				width: "100%",
				height: "100%",
				padding: "48px",
				backgroundColor: colors.bgPage,
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
							color: colors.accentAmber,
							fontFamily: "monospace",
						}}
					>
						{score}/10
					</span>
					<span
						style={{
							fontSize: "24px",
							color: colors.textTertiary,
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
							color: colors.textPrimary,
							fontFamily: "sans-serif",
							lineHeight: 1.4,
						}}
					>
						{truncatedComment}
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
						color: colors.textTertiary,
						fontFamily: "monospace",
					}}
				>
					{language}
				</span>
				<span
					style={{
						fontSize: "18px",
						color: colors.textTertiary,
						fontFamily: "monospace",
					}}
				>
					{lineCount} lines
				</span>
			</div>
		</div>
	);
}
