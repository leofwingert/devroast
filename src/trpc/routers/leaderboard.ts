import { asc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { roasts, submissions } from "@/db/schema";
import { baseProcedure, createTRPCRouter } from "../init";

export const leaderboardRouter = createTRPCRouter({
	/** Top N worst code submissions — lowest score = worst (Screen 1 preview + Screen 3) */
	getTop: baseProcedure
		.input(z.object({ limit: z.number().min(1).max(50).default(50) }))
		.query(async ({ ctx, input }) => {
			const rows = await ctx.db
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
				.limit(input.limit);

			return rows.map((row) => ({
				...row,
				score: Number.parseFloat(row.score),
			}));
		}),
});
