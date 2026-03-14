# Create Roast Feature Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow users to submit code, get AI analysis, and view results on a dedicated page.

**Architecture:** Use Next.js Server Actions to handle form submission, redirect to `/roast/[id]`, and fetch from database.

**Tech Stack:** Next.js Server Actions, Drizzle ORM, AI integration (placeholder for now)

---

## Task 1: Create AI Analysis Service

**Files:**
- Create: `src/lib/ai.ts`

- [ ] **Step 1: Create ai.ts with mock analysis function**

```typescript
import type { Issue, DiffLine } from "@/db/schema";

export type RoastResult = {
	score: number;
	verdict: "needs_serious_help" | "rough_around_the_edges" | "not_terrible" | "actually_decent" | "solid_code";
	roastComment: string;
	issues: Array<{
		severity: "critical" | "warning" | "good";
		title: string;
		description: string;
	}>;
	diffLines: Array<{
		type: "added" | "removed" | "context";
		content: string;
	}>;
};

export async function analyzeCode(
	code: string,
	language: string,
	roastMode: boolean,
): Promise<RoastResult> {
	// TODO: Integrate with actual AI
	// For now, return mock data based on roastMode
	return {
		score: roastMode ? 2.5 : 5.5,
		verdict: roastMode ? "needs_serious_help" : "rough_around_the_edges",
		roastMode,
		roastComment: roastMode
			? `"This code is what happens when you let an AI write your code."`
			: `"This code works but could be improved with some refactoring."`,
		issues: [
			{
				severity: "critical",
				title: "No error handling",
				description: "This function will throw on null/undefined input.",
			},
			{
				severity: "warning",
				title: "Magic numbers",
				description: "Hardcoded values should be named constants.",
			},
			{
				severity: "good",
				title: "Clear function name",
				description: "The function intent is clear from the name.",
			},
		],
		diffLines: [
			{ type: "removed", content: "function calculateTotal(items) {" },
			{ type: "added", content: "function calculateTotal(items = []) {" },
			{ type: "removed", content: "  var total = 0;" },
			{ type: "added", content: "  let total = 0;" },
			{ type: "context", content: "  // ..." },
			{ type: "added", content: "  return total;" },
			{ type: "context", content: "}" },
		],
	};
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/ai.ts
git commit -m "feat: add AI analysis service"
```

---

## Task 2: Create Server Action for Form Submission

**Files:**
- Create: `src/app/actions.ts`

- [ ] **Step 1: Create actions.ts with createRoast Server Action**

```typescript
"use server";

import { db } from "@/db";
import { diffLines, roastIssues, roasts, submissions } from "@/db/schema";
import { redirect } from "next/navigation";
import { analyzeCode } from "@/lib/ai";

export async function createRoast(formData: FormData) {
	const code = formData.get("code") as string;
	const language = formData.get("language") as string;
	const roastMode = formData.get("roastMode") === "true";

	if (!code || code.trim().length === 0) {
		throw new Error("Code is required");
	}

	const lineCount = code.split("\n").length;

	// Save submission
	const [submission] = await db
		.insert(submissions)
		.values({
			code,
			language,
			lineCount,
			roastMode,
		})
		.returning();

	// Get AI analysis
	const result = await analyzeCode(code, language, roastMode);

	// Save roast
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

	// Save issues
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

	// Save diff lines
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

	// Redirect to result page
	redirect(`/roast/${roast.id}`);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/actions.ts
git commit -m "feat: add createRoast Server Action"
```

---

## Task 3: Update Homepage to Use Server Action

**Files:**
- Modify: `src/app/home-content.tsx`

- [ ] **Step 1: Add useFormStatus for loading state**

Add this import and state near the top of the component:
```tsx
import { useFormStatus } from "react-dom";

function SubmitButton({ disabled }: { disabled: boolean }) {
	const { pending } = useFormStatus();
	return (
		<Button variant="primary" size="md" disabled={disabled || pending}>
			{pending ? "$ roasting..." : "$ roast_my_code"}
		</Button>
	);
}
```

- [ ] **Step 2: Convert to form with Server Action**

Replace the Button with a form:

```tsx
<form action={createRoast}>
	<input type="hidden" name="code" value={code} />
	<input type="hidden" name="language" value={selectedLanguage ?? ""} />
	<input
		type="hidden"
		name="roastMode"
		value={roastMode ? "true" : "false"}
	/>
	<SubmitButton disabled={isEmpty || isOverLimit} />
</form>
```

- [ ] **Step 3: Add roastMode state**

Add state for roast mode toggle:
```tsx
const [roastMode, setRoastMode] = useState(true);
```

And update the Toggle:
```tsx
<Toggle checked={roastMode} onCheckedChange={setRoastMode}>
	<ToggleLabel>roast mode</ToggleLabel>
</Toggle>
```

- [ ] **Step 4: Import createRoast**

```tsx
import { createRoast } from "@/app/actions";
```

- [ ] **Step 5: Commit**

```bash
git add src/app/home-content.tsx
git commit -m "feat: wire up createRoast form to homepage"
```

---

## Task 4: Update Roast Result Page to Fetch from Database

**Files:**
- Modify: `src/app/roast/[id]/page.tsx`

- [ ] **Step 1: Add database query functions**

Import at top:
```tsx
import { db } from "@/db";
import { diffLines, roastIssues, roasts, submissions } from "@/db/schema";
import { eq } from "drizzle-orm";
```

- [ ] **Step 2: Fetch data in page component**

Replace the static `staticRoast` with database query:

```tsx
export default async function RoastResultPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;

	// Fetch roast with submission
	const [roast] = await db
		.select()
		.from(roasts)
		.where(eq(roasts.id, id))
		.limit(1);

	if (!roast) {
		return (
			<main className="flex w-full flex-col items-center">
				<section className="flex w-full max-w-[1280px] flex-col gap-10 px-20 py-10">
					<h1 className="font-mono text-2xl text-accent-red">
						Roast not found
					</h1>
				</section>
			</main>
		);
	}

	const [submission] = await db
		.select()
		.from(submissions)
		.where(eq(submissions.id, roast.submissionId))
		.limit(1);

	const issues = await db
		.select()
		.from(roastIssues)
		.where(eq(roastIssues.roastId, roast.id))
		.orderBy(roastIssues.sortOrder);

	const diff = await db
		.select()
		.from(diffLines)
		.where(eq(diffLines.roastId, roast.id))
		.orderBy(diffLines.lineNumber);

	// ... use these in the component
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/roast/\[id\]/page.tsx
git commit -m "feat: fetch roast data from database"
```

---

## Task 5: Test End-to-End

- [ ] **Step 1: Run build to verify no errors**

```bash
npm run build
```

- [ ] **Step 2: Commit final changes**

```bash
git add -A && git commit -m "feat: complete create roast feature"
```
