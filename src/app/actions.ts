"use server";

import { redirect } from "next/navigation";
import { db } from "@/db";
import { diffLines, roastIssues, roasts, submissions } from "@/db/schema";
import { analyzeCode } from "@/lib/ai";

export async function createRoast(formData: FormData) {
	const code = formData.get("code") as string;
	const language = formData.get("language") as string;
	const roastMode = formData.get("roastMode") === "true";

	if (!code || code.trim().length === 0) {
		throw new Error("Code is required");
	}

	const lineCount = code.split("\n").length;

	const [submission] = await db
		.insert(submissions)
		.values({
			code,
			language,
			lineCount,
			roastMode,
		})
		.returning();

	const result = await analyzeCode(code, language, roastMode);

	const [roast] = await db
		.insert(roasts)
		.values({
			submissionId: submission.id,
			score: result.score.toString(),
			roastComment: result.roastComment,
			verdict: result.verdict,
			suggestedFix: result.diffLines.map((l) => l.content).join("\n"),
		})
		.returning();

	if (result.issues.length > 0) {
		await db.insert(roastIssues).values(
			result.issues.map((issue, index) => ({
				roastId: roast.id,
				severity: issue.severity,
				title: issue.title,
				description: issue.description,
				sortOrder: index,
			})),
		);
	}

	if (result.diffLines.length > 0) {
		await db.insert(diffLines).values(
			result.diffLines.map((line, index) => ({
				roastId: roast.id,
				type: line.type,
				content: line.content,
				lineNumber: index + 1,
			})),
		);
	}

	redirect(`/roast/${roast.id}`);
}
