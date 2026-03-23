import { eq } from "drizzle-orm";
import { ImageResponse } from "next/og";
import type { ReactElement } from "react";
import sharp from "sharp";
import { db } from "@/db";
import { roasts, submissions } from "@/db/schema";

export const runtime = "nodejs";
export const contentType = "image/png";
export const alt = "DevRoast result image";
const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 630;
const INTERNAL_SCALE = 2;

export const size = {
	width: CANVAS_WIDTH,
	height: CANVAS_HEIGHT,
};

export default async function Image({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;

	const [roast] = await db()
		.select()
		.from(roasts)
		.where(eq(roasts.id, id))
		.limit(1);

	if (!roast) {
		return renderOgPng(
			<div
				style={{
					display: "flex",
					width: "100%",
					height: "100%",
					background: "#0A0A0A",
					color: "#FAFAFA",
					fontSize: 40,
					fontFamily: "JetBrains Mono, ui-monospace, monospace",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				roast_not_found
			</div>,
		);
	}

	const [submission] = await db()
		.select()
		.from(submissions)
		.where(eq(submissions.id, roast.submissionId))
		.limit(1);

	const score = Number.parseFloat(roast.score).toFixed(1);
	const verdictColor = getVerdictColor(roast.verdict);
	const langInfo = `lang: ${submission?.language ?? "unknown"} \u00B7 ${
		submission?.lineCount ?? 0
	} lines`;
	const roastQuote = `\u201C${roast.roastComment}\u201D`;

	return renderOgPng(
		<div
			style={{
				display: "flex",
				width: "100%",
				height: "100%",
				background: "#0A0A0A",
			}}
		>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					width: "100%",
					height: "100%",
					border: "1px solid #2A2A2A",
					padding: "64px",
					background: "#0A0A0A",
					gap: "28px",
					justifyContent: "center",
					alignItems: "center",
				}}
			>
				<div
					style={{
						display: "flex",
						gap: "8px",
						justifyContent: "center",
						alignItems: "center",
					}}
				>
					<div
						style={{
							display: "flex",
							fontFamily: "JetBrains Mono, ui-monospace, monospace",
							fontSize: 24,
							fontWeight: 700,
							color: "#10B981",
						}}
					>
						{">"}
					</div>
					<div
						style={{
							display: "flex",
							fontFamily: "JetBrains Mono, ui-monospace, monospace",
							fontSize: 20,
							fontWeight: 500,
							color: "#FAFAFA",
						}}
					>
						devroast
					</div>
				</div>

				<div
					style={{
						display: "flex",
						gap: "4px",
						justifyContent: "center",
						alignItems: "flex-end",
					}}
				>
					<div
						style={{
							display: "flex",
							fontFamily: "JetBrains Mono, ui-monospace, monospace",
							fontSize: 160,
							fontWeight: 900,
							lineHeight: 1,
							color: "#F59E0B",
						}}
					>
						{score}
					</div>
					<div
						style={{
							display: "flex",
							fontFamily: "JetBrains Mono, ui-monospace, monospace",
							fontSize: 56,
							lineHeight: 1,
							color: "#4B5563",
						}}
					>
						/10
					</div>
				</div>

				<div
					style={{
						display: "flex",
						gap: "8px",
						justifyContent: "center",
						alignItems: "center",
					}}
				>
					<div
						style={{
							display: "flex",
							width: 12,
							height: 12,
							borderRadius: 9999,
							background: verdictColor,
						}}
					/>
					<div
						style={{
							display: "flex",
							fontFamily: "JetBrains Mono, ui-monospace, monospace",
							fontSize: 20,
							color: verdictColor,
						}}
					>
						{roast.verdict}
					</div>
				</div>

				<div
					style={{
						display: "flex",
						fontFamily: "JetBrains Mono, ui-monospace, monospace",
						fontSize: 16,
						color: "#4B5563",
					}}
				>
					{langInfo}
				</div>

				<div
					style={{
						display: "flex",
						width: "100%",
						fontFamily:
							"IBM Plex Mono, JetBrains Mono, ui-monospace, monospace",
						fontSize: 22,
						lineHeight: 1.5,
						color: "#FAFAFA",
						textAlign: "center",
					}}
				>
					{roastQuote}
				</div>
			</div>
		</div>,
	);
}

function getVerdictColor(verdict: string) {
	switch (verdict) {
		case "needs_serious_help":
			return "#EF4444";
		case "rough_around_the_edges":
			return "#F59E0B";
		case "not_terrible":
			return "#F59E0B";
		case "actually_decent":
			return "#10B981";
		case "solid_code":
			return "#10B981";
		default:
			return "#F59E0B";
	}
}

async function renderOgPng(element: ReactElement) {
	const internalWidth = CANVAS_WIDTH * INTERNAL_SCALE;
	const internalHeight = CANVAS_HEIGHT * INTERNAL_SCALE;

	const highResImage = new ImageResponse(
		<div
			style={{
				display: "flex",
				width: "100%",
				height: "100%",
				background: "#0A0A0A",
				alignItems: "flex-start",
				justifyContent: "flex-start",
			}}
		>
			<div
				style={{
					display: "flex",
					width: CANVAS_WIDTH,
					height: CANVAS_HEIGHT,
					transform: `scale(${INTERNAL_SCALE})`,
					transformOrigin: "top left",
				}}
			>
				{element}
			</div>
		</div>,
		{
			width: internalWidth,
			height: internalHeight,
		},
	);

	const highResBuffer = Buffer.from(await highResImage.arrayBuffer());
	const finalBuffer = await sharp(highResBuffer)
		.resize(CANVAS_WIDTH, CANVAS_HEIGHT, {
			fit: "fill",
			kernel: sharp.kernel.lanczos3,
		})
		.png({
			compressionLevel: 9,
			adaptiveFiltering: true,
			palette: false,
		})
		.toBuffer();

	return new Response(new Uint8Array(finalBuffer), {
		headers: {
			"Content-Type": "image/png",
		},
	});
}
