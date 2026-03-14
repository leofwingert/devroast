import type { ReactNode } from "react";

interface RoastOGProps {
	score: string;
	verdict: string;
	language: string;
	lineCount: number;
	roastComment: string;
}

export function RoastOGTemplate(props: RoastOGProps): ReactNode {
	const truncatedComment =
		props.roastComment.length > 100
			? `${props.roastComment.slice(0, 97)}...`
			: props.roastComment;

	return (
		<div
			style={{
				width: 1200,
				height: 630,
				backgroundColor: "#0a0a0a",
				padding: 64,
				display: "flex",
				flexDirection: "column",
				justifyContent: "center",
				gap: 24,
				fontFamily: "JetBrains Mono, monospace",
			}}
		>
			<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
				<span style={{ color: "#10b981", fontSize: 24 }}>&gt;</span>
				<span style={{ color: "#fafafa", fontSize: 24 }}>devroast</span>
			</div>

			<div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
				<span style={{ color: "#f59e0b", fontSize: 160, fontWeight: 700 }}>
					{props.score}
				</span>
				<span style={{ color: "#4b5563", fontSize: 56 }}>/10</span>
			</div>

			<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
				<div
					style={{
						width: 12,
						height: 12,
						borderRadius: 6,
						backgroundColor: "#ef4444",
					}}
				/>
				<span style={{ color: "#ef4444", fontSize: 20 }}>{props.verdict}</span>
			</div>

			<div style={{ color: "#4b5563", fontSize: 16 }}>
				lang: {props.language} · {props.lineCount} lines
			</div>

			<div
				style={{
					color: "#fafafa",
					fontSize: 22,
					textAlign: "center",
					maxWidth: "100%",
				}}
			>
				{truncatedComment}
			</div>
		</div>
	);
}
