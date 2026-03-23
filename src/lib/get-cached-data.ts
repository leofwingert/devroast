import { asc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { roasts, submissions } from "@/db/schema";

const QUERY_TIMEOUT_MS = 2500;

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
	try {
		const [result] = await withTimeout(
			db
				.select({
					totalRoasts: sql<number>`count(*)`,
					avgScore: sql<number>`avg(${roasts.score})`,
				})
				.from(roasts),
			QUERY_TIMEOUT_MS,
			"getCachedStats",
		);

		return {
			totalRoasts: Number(result?.totalRoasts) || 0,
			avgScore: Number(result?.avgScore) || 0,
		};
	} catch (error) {
		console.error("getCachedStats query failed", error);
		return {
			totalRoasts: 0,
			avgScore: 0,
		};
	}
}

export async function getCachedLeaderboard(
	limit: number,
): Promise<LeaderboardEntry[]> {
	try {
		const rows = await withTimeout(
			db
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
				.limit(limit),
			QUERY_TIMEOUT_MS,
			"getCachedLeaderboard",
		);

		return rows.map((row) => ({
			...row,
			score: Number.parseFloat(row.score),
		}));
	} catch (error) {
		console.error("getCachedLeaderboard query failed", error);
		return [];
	}
}

function withTimeout<T>(
	promise: Promise<T>,
	timeoutMs: number,
	label: string,
): Promise<T> {
	let timeoutId: ReturnType<typeof setTimeout> | null = null;
	const timeoutPromise = new Promise<T>((_, reject) => {
		timeoutId = setTimeout(() => {
			reject(new Error(`${label} timed out after ${timeoutMs}ms`));
		}, timeoutMs);
	});

	return Promise.race([promise, timeoutPromise]).finally(() => {
		if (timeoutId) {
			clearTimeout(timeoutId);
		}
	});
}
