import { ImageResponse } from "@takumi-rs/image-response";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { roasts, submissions } from "@/db/schema";
import { RoastOGTemplate } from "@/lib/takumi-og";

export const runtime = "edge";

export async function GET(
	_: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params;

	const [roast] = await db
		.select()
		.from(roasts)
		.where(eq(roasts.id, id))
		.limit(1);

	if (!roast) {
		return new ImageResponse(
			<ImageResponse
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
			</ImageResponse>,
			{ width: 1200, height: 630, format: "png" },
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
		{ width: 1200, height: 630, format: "png" },
	);
}
