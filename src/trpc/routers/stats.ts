import { avg, count } from "drizzle-orm";
import { roasts } from "@/db/schema";
import { baseProcedure, createTRPCRouter } from "../init";

export const statsRouter = createTRPCRouter({
	/** Total de roasts + media de score (Screen 1 — footer stats) */
	getSummary: baseProcedure.query(async ({ ctx }) => {
		const [result] = await ctx.db
			.select({
				totalRoasts: count(),
				avgScore: avg(roasts.score),
			})
			.from(roasts);

		return {
			totalRoasts: result.totalRoasts,
			avgScore: result.avgScore ? Number.parseFloat(result.avgScore) : 0,
		};
	}),
});