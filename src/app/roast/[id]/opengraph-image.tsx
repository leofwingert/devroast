/** @jsxImportSource react */
import { ImageResponse } from "@takumi-rs/image-response/wasm";
import module from "@takumi-rs/wasm/next";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { roasts, submissions } from "@/db/schema";
import { RoastOGTemplate } from "@/lib/takumi-og";

export const alt = "DevRoast - Code Roast Result";
export const size = {
	width: 1200,
	height: 630,
};
export const contentType = "image/png";

export default async function Image({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;

	const [roast] = await db
		.select()
		.from(roasts)
		.where(eq(roasts.id, id))
		.limit(1);

	if (!roast) {
		return new ImageResponse(
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					backgroundColor: "#0a0a0a",
					width: "100%",
					height: "100%",
				}}
			>
				<span
					style={{
						fontSize: "32px",
						color: "#ef4444",
						fontFamily: "monospace",
					}}
				>
					Roast not found
				</span>
			</div>,
			{ module, ...size },
		);
	}

	const [submission] = await db
		.select()
		.from(submissions)
		.where(eq(submissions.id, roast.submissionId))
		.limit(1);

	const score = parseFloat(roast.score).toFixed(1);
	const language = submission?.language ?? "unknown";
	const lineCount = submission?.lineCount ?? 0;
	const roastComment = roast.roastComment ?? "";

	return new ImageResponse(
		<RoastOGTemplate
			score={score}
			language={language}
			lineCount={lineCount}
			roastComment={roastComment}
		/>,
		{ module, ...size },
	);
}