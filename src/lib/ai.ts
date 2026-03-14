import { GoogleGenerativeAI } from "@google/generative-ai";

export type RoastResult = {
	score: number;
	verdict:
		| "needs_serious_help"
		| "rough_around_the_edges"
		| "not_terrible"
		| "actually_decent"
		| "solid_code";
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

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

const SYSTEM_PROMPT_ROAST = `You are DevRoast, an AI that brutally roasts code submissions. Your goal is to be sarcastically harsh but technically accurate.

When analyzing code:
1. Give a score from 0-10 (lower = worse/more embarrassing)
2. Provide a sarcastic roast comment
3. List specific issues with severity (critical/warning/good)
4. Show a diff with suggested fixes

Respond ONLY with valid JSON in this exact format:
{
  "score": <number 0-10>,
  "verdict": "<needs_serious_help|rough_around_the_edges|not_terrible|actually_decent|solid_code>",
  "roastComment": "<sarcastic roast comment>",
  "issues": [
    {"severity": "<critical|warning|good>", "title": "<issue title>", "description": "<description>"}
  ],
  "diffLines": [
    {"type": "<added|removed|context>", "content": "<line content>"}
  ]
}`;

const SYSTEM_PROMPT_CONSTRUCTIVE = `You are DevRoast, a helpful code reviewer. Give constructive, gentle feedback.

When analyzing code:
1. Give a score from 0-10
2. Provide encouraging but honest feedback
3. List specific issues with severity
4. Show a diff with suggested fixes

Respond ONLY with valid JSON in this exact format:
{
  "score": <number 0-10>,
  "verdict": "<needs_serious_help|rough_around_the_edges|not_terrible|actually_decent|solid_code>",
  "roastComment": "<constructive feedback>",
  "issues": [
    {"severity": "<critical|warning|good>", "title": "<issue title>", "description": "<description>"}
  ],
  "diffLines": [
    {"type": "<added|removed|context>", "content": "<line content>"}
  ]
}`;

export async function analyzeCode(
	code: string,
	language: string,
	roastMode: boolean,
): Promise<RoastResult> {
	const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

	const systemPrompt = roastMode
		? SYSTEM_PROMPT_ROAST
		: SYSTEM_PROMPT_CONSTRUCTIVE;

	const prompt = `${systemPrompt}

Language: ${language || "auto-detect"}

Code to analyze:
\`\`\`${language}
${code}
\`\`\``;

	try {
		const result = await model.generateContent(prompt);
		const response = result.response.text();

		// Extract JSON from response (handle potential markdown code blocks)
		const jsonMatch =
			response.match(/```json\n([\s\S]*?)\n```/) ||
			response.match(/\{[\s\S]*\}/);

		if (!jsonMatch) {
			throw new Error("Invalid response format");
		}

		const jsonStr = jsonMatch[1] || jsonMatch[0];
		const parsed = JSON.parse(jsonStr);

		return {
			score: Math.max(0, Math.min(10, parsed.score ?? 5)),
			verdict: parsed.verdict ?? "rough_around_the_edges",
			roastComment: parsed.roastComment ?? "Could not generate roast.",
			issues: Array.isArray(parsed.issues) ? parsed.issues : [],
			diffLines: Array.isArray(parsed.diffLines) ? parsed.diffLines : [],
		};
	} catch (error) {
		console.error("AI analysis failed:", error);

		// Return fallback on error
		return {
			score: 5,
			verdict: "rough_around_the_edges",
			roastComment: roastMode
				? `"Even the AI gave up on analyzing this code."`
				: `"Let's try that again with different code."`,
			issues: [
				{
					severity: "warning",
					title: "Analysis failed",
					description: "Could not analyze the code. Please try again.",
				},
			],
			diffLines: [],
		};
	}
}
