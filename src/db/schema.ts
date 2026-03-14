import {
	boolean,
	index,
	integer,
	numeric,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";

/** Severity dos issues encontrados na análise */
export const issueSeverityEnum = pgEnum("issue_severity", [
	"critical",
	"warning",
	"good",
]);

/** Veredicto geral do roast */
export const verdictEnum = pgEnum("verdict", [
	"needs_serious_help",
	"rough_around_the_edges",
	"not_terrible",
	"actually_decent",
	"solid_code",
]);

/** Tipo de linha no diff sugerido */
export const diffLineTypeEnum = pgEnum("diff_line_type", [
	"added",
	"removed",
	"context",
]);

// ---------------------------------------------------------------------------
// Tables
// ---------------------------------------------------------------------------

export const submissions = pgTable("submissions", {
	id: uuid().defaultRandom().primaryKey(),
	code: text().notNull(),
	language: text().notNull(),
	lineCount: integer().notNull(),
	roastMode: boolean().notNull().default(false),
	createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

export const roasts = pgTable(
	"roasts",
	{
		id: uuid().defaultRandom().primaryKey(),
		submissionId: uuid()
			.notNull()
			.references(() => submissions.id, { onDelete: "cascade" })
			.unique(),
		score: numeric({ precision: 3, scale: 1 }).notNull(),
		roastComment: text().notNull(),
		verdict: verdictEnum().notNull(),
		suggestedFix: text(),
		createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
	},
	(t) => [index("roasts_score_idx").on(t.score)],
);

export const roastIssues = pgTable("roast_issues", {
	id: uuid().defaultRandom().primaryKey(),
	roastId: uuid()
		.notNull()
		.references(() => roasts.id, { onDelete: "cascade" }),
	severity: issueSeverityEnum().notNull(),
	title: text().notNull(),
	description: text().notNull(),
	sortOrder: integer().notNull().default(0),
});

export const diffLines = pgTable("diff_lines", {
	id: uuid().defaultRandom().primaryKey(),
	roastId: uuid()
		.notNull()
		.references(() => roasts.id, { onDelete: "cascade" }),
	type: diffLineTypeEnum().notNull(),
	content: text().notNull(),
	lineNumber: integer().notNull(),
});
