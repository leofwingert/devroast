import type { Metadata } from "next";
import type { BundledLanguage } from "shiki";
import {
	EntryCode,
	EntryMeta,
	LeaderboardEntry,
} from "@/components/ui/leaderboard-entry";

export const metadata: Metadata = {
	title: "Shame Leaderboard - DevRoast",
	description:
		"The most roasted code on the internet. See the worst-scoring submissions ranked by shame.",
	openGraph: {
		title: "Shame Leaderboard - DevRoast",
		description:
			"The most roasted code on the internet. See the worst-scoring submissions ranked by shame.",
	},
};

interface LeaderboardItem {
	rank: number;
	score: number;
	language: string;
	shikiLanguage: BundledLanguage;
	code: string;
}

const leaderboardData: LeaderboardItem[] = [
	{
		rank: 1,
		score: 1.2,
		language: "javascript",
		shikiLanguage: "javascript",
		code: `eval(prompt("enter code"))
document.write(response)
// trust the user lol`,
	},
	{
		rank: 2,
		score: 1.8,
		language: "typescript",
		shikiLanguage: "typescript",
		code: `if (x == true) { return true; }
else if (x == false) { return false; }
else { return !false; }`,
	},
	{
		rank: 3,
		score: 2.1,
		language: "sql",
		shikiLanguage: "sql",
		code: `SELECT * FROM users WHERE 1=1
-- TODO: add authentication`,
	},
	{
		rank: 4,
		score: 2.3,
		language: "java",
		shikiLanguage: "java",
		code: `catch (e) {
  // ignore
}`,
	},
	{
		rank: 5,
		score: 2.5,
		language: "javascript",
		shikiLanguage: "javascript",
		code: `const sleep = (ms) =>
  new Date(Date.now() + ms)
  while(new Date() < end) {}`,
	},
];

const totalSubmissions = "2,847";
const avgScore = "4.2";

export default function LeaderboardPage() {
	const lineCount = (code: string) => code.split("\n").length;

	return (
		<main className="flex w-full flex-col items-center">
			<section className="flex w-full max-w-[1280px] flex-col gap-10 px-20 py-10">
				{/* Hero Section */}
				<div className="flex flex-col gap-4">
					<div className="flex items-center gap-3">
						<span className="font-mono text-[32px] font-bold text-accent-green">
							{">"}
						</span>
						<h1 className="font-mono text-[28px] font-bold text-text-primary">
							shame_leaderboard
						</h1>
					</div>
					<p className="font-mono text-sm text-text-secondary">
						{"// the most roasted code on the internet"}
					</p>
					<div className="flex items-center gap-2">
						<span className="font-mono text-xs text-text-tertiary">
							{totalSubmissions} submissions
						</span>
						<span className="font-mono text-xs text-text-tertiary">
							&middot;
						</span>
						<span className="font-mono text-xs text-text-tertiary">
							avg score: {avgScore}/10
						</span>
					</div>
				</div>

				{/* Leaderboard Entries */}
				<div className="flex flex-col gap-5">
					{leaderboardData.map((entry) => (
						<LeaderboardEntry key={entry.rank}>
							<EntryMeta
								rank={entry.rank}
								score={entry.score}
								language={entry.language}
								lineCount={lineCount(entry.code)}
							/>
							<EntryCode code={entry.code} language={entry.shikiLanguage} />
						</LeaderboardEntry>
					))}
				</div>
			</section>
		</main>
	);
}
