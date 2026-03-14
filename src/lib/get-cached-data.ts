import { asc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { roasts, submissions } from "@/db/schema";

export type Stats = {
	totalRoasts: number;
	avgScore: number;
};

export type LeaderboardEntry = {
	rank: number;
	score: number;
	code: string;
	language: string;
	lineCount: number;
};

export async function getCachedStats(): Promise<Stats> {
	const [result] = await db
		.select({
			totalRoasts: sql<number>`count(*)`,
			avgScore: sql<number>`avg(${roasts.score})`,
		})
		.from(roasts);

	return {
		totalRoasts: Number(result?.totalRoasts) || 0,
		avgScore: Number(result?.avgScore) || 0,
	};
}

export async function getCachedLeaderboard(
	limit: number,
): Promise<LeaderboardEntry[]> {
	const rows = await db
		.select({
			rank: sql<number>`ROW_NUMBER() OVER (ORDER BY ${roasts.score} ASC)`,
			score: roasts.score,
			code: submissions.code,
			language: submissions.language,
			lineCount: submissions.lineCount,
		})
		.from(roasts)
		.innerJoin(submissions, eq(roasts.submissionId, submissions.id))
		.orderBy(asc(roasts.score))
		.limit(limit);

	return rows.map((row) => ({
		...row,
		score: Number.parseFloat(row.score),
	}));
}
