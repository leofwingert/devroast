/** @jsxImportSource react */
import type { ReactNode } from "react";

interface RoastOGProps {
	score: string;
	language: string;
	lineCount: number;
	roastComment: string;
}

export function RoastOGTemplate({
	score,
	language,
	lineCount,
	roastComment,
}: RoastOGProps): ReactNode {
	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				justifyContent: "center",
				alignItems: "center",
				width: 1200,
				height: 630,
				padding: 48,
				backgroundColor: "#0a0a0a",
			}}
		>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					gap: 32,
				}}
			>
				<span
					style={{
						fontSize: 100,
						fontWeight: 700,
						color: "#f59e0b",
						fontFamily: "monospace",
					}}
				>
					{score}/10
				</span>

				<span style={{ color: "#71717a", fontSize: 24 }}>
					{language || "?"} · {lineCount} lines
				</span>

				<span
					style={{
						color: "#fafafa",
						fontSize: 28,
						textAlign: "center",
						maxWidth: 800,
					}}
				>
					{roastComment || "No comment"}
				</span>

				<span style={{ color: "#10b981", fontSize: 32, marginTop: 16 }}>
					devroast
				</span>
			</div>
		</div>
	);
}
