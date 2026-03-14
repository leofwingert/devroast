import { config } from "dotenv";

config({ path: ".env.local" });

import { faker } from "@faker-js/faker";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { diffLines, roastIssues, roasts, submissions } from "./schema";

// ---------------------------------------------------------------------------
// Connection
// ---------------------------------------------------------------------------

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client, { casing: "snake_case" });

// ---------------------------------------------------------------------------
// Constants — realistic data pools
// ---------------------------------------------------------------------------

const LANGUAGES = [
	"javascript",
	"typescript",
	"python",
	"java",
	"go",
	"rust",
	"ruby",
	"php",
	"c",
	"sql",
];

const VERDICTS = [
	"needs_serious_help",
	"rough_around_the_edges",
	"not_terrible",
	"actually_decent",
	"solid_code",
] as const;

const SEVERITIES = ["critical", "warning", "good"] as const;

const DIFF_LINE_TYPES = ["added", "removed", "context"] as const;

const CODE_SNIPPETS: Record<string, string[]> = {
	javascript: [
		`var total = 0;
for (var i = 0; i < items.length; i++) {
  total += items[i].price;
}
console.log(total);`,
		`function getData() {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "/api/data", false);
  xhr.send();
  return JSON.parse(xhr.responseText);
}`,
		`document.getElementById("btn").onclick = function() {
  var name = prompt("Enter name");
  if (name != null && name != "") {
    alert("Hello " + name + "!");
  }
}`,
		`function sortArray(arr) {
  for (var i = 0; i < arr.length; i++) {
    for (var j = 0; j < arr.length - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        var temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
  }
  return arr;
}`,
		`let data = null;
fetch("/api/users")
  .then(function(res) { return res.json(); })
  .then(function(json) { data = json; })
  .catch(function(err) { console.log(err); });`,
	],
	typescript: [
		`const fetchUser = async (id: any): Promise<any> => {
  const res = await fetch(\`/api/users/\${id}\`);
  const data: any = await res.json();
  return data;
}`,
		`interface Props {
  data: any;
  callback: Function;
  items: Array<any>;
}

function process(props: Props) {
  // @ts-ignore
  return props.data.map((item: any) => item.value);
}`,
		`class UserService {
  private users: any[] = [];

  addUser(user: any) {
    this.users.push(user);
  }

  getUser(id: any): any {
    return this.users.find((u: any) => u.id == id);
  }

  deleteUser(id: any) {
    this.users = this.users.filter((u: any) => u.id != id);
  }
}`,
		`export const handler = async (req: any, res: any) => {
  try {
    const body = req.body;
    const result = await db.query(body.sql);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: "something went wrong" });
  }
}`,
		`type Config = {
  [key: string]: any;
}

function merge(a: Config, b: Config): Config {
  let result: any = {};
  for (let key in a) result[key] = a[key];
  for (let key in b) result[key] = b[key];
  return result;
}`,
	],
	python: [
		`def get_users():
    users = []
    f = open("users.txt", "r")
    for line in f:
        users.append(line)
    f.close()
    return users`,
		`import os
def run_command(cmd):
    result = os.system(cmd)
    return result`,
		`class Calculator:
    def calculate(self, operation, a, b):
        if operation == "add":
            return a + b
        elif operation == "subtract":
            return a - b
        elif operation == "multiply":
            return a * b
        elif operation == "divide":
            return a / b
        else:
            return None`,
		`def fibonacci(n):
    if n == 0:
        return 0
    elif n == 1:
        return 1
    else:
        return fibonacci(n - 1) + fibonacci(n - 2)`,
		`password = "admin123"
db_host = "production-db.company.com"

def connect():
    import mysql.connector
    return mysql.connector.connect(
        host=db_host,
        user="root",
        password=password
    )`,
	],
	java: [
		`public class Utils {
    public static Object process(Object input) {
        if (input instanceof String) {
            return ((String) input).toUpperCase();
        } else if (input instanceof Integer) {
            return (Integer) input * 2;
        } else if (input instanceof List) {
            return ((List) input).size();
        }
        return null;
    }
}`,
		`public void saveUser(String name, String email, int age) {
    String sql = "INSERT INTO users VALUES ('" + name + "', '" + email + "', " + age + ")";
    connection.createStatement().execute(sql);
}`,
		`public class Singleton {
    private static Singleton instance = null;
    public String data = "";

    public static Singleton getInstance() {
        if (instance == null) {
            instance = new Singleton();
        }
        return instance;
    }
}`,
	],
	go: [
		`func getUser(id string) map[string]interface{} {
	resp, _ := http.Get("http://api.com/users/" + id)
	body, _ := ioutil.ReadAll(resp.Body)
	var result map[string]interface{}
	json.Unmarshal(body, &result)
	return result
}`,
		`func processItems(items []string) []string {
	var result []string
	for i := 0; i < len(items); i++ {
		if items[i] != "" {
			result = append(result, strings.ToUpper(items[i]))
		}
	}
	return result
}`,
	],
	rust: [
		`fn parse_config(path: &str) -> HashMap<String, String> {
    let contents = std::fs::read_to_string(path).unwrap();
    let mut map = HashMap::new();
    for line in contents.lines() {
        let parts: Vec<&str> = line.split("=").collect();
        map.insert(parts[0].to_string(), parts[1].to_string());
    }
    map
}`,
	],
	ruby: [
		`def send_email(to, subject, body)
  system("echo '#{body}' | mail -s '#{subject}' #{to}")
end`,
		`class UserController < ApplicationController
  def create
    user = User.new(params)
    user.save
    redirect_to user
  rescue => e
    render json: { error: e.message }
  end
end`,
	],
	php: [
		`<?php
function getUser($id) {
    $conn = mysqli_connect("localhost", "root", "", "mydb");
    $result = mysqli_query($conn, "SELECT * FROM users WHERE id = $id");
    return mysqli_fetch_assoc($result);
}
?>`,
		`<?php
$password = $_POST['password'];
$hash = md5($password);
$sql = "INSERT INTO users (name, password) VALUES ('" . $_POST['name'] . "', '$hash')";
mysqli_query($conn, $sql);
?>`,
	],
	c: [
		`char* concat(char* a, char* b) {
    char* result = malloc(strlen(a) + strlen(b) + 1);
    strcpy(result, a);
    strcat(result, b);
    return result;
}`,
		`void sort(int arr[], int n) {
    int i, j, temp;
    for (i = 0; i < n; i++)
        for (j = 0; j < n - 1; j++)
            if (arr[j] > arr[j+1]) {
                temp = arr[j];
                arr[j] = arr[j+1];
                arr[j+1] = temp;
            }
}`,
	],
	sql: [
		`SELECT * FROM users WHERE name LIKE '%' + @search + '%';
DELETE FROM logs;
UPDATE users SET admin = 1 WHERE id = 1;`,
		`SELECT u.*, o.*, p.*
FROM users u, orders o, products p
WHERE u.id = o.user_id AND o.product_id = p.id
AND u.active = 1
ORDER BY u.name;`,
	],
};

const ROAST_COMMENTS = [
	"this code looks like it was written during a power outage... in 2005.",
	"i've seen better error handling in a toaster.",
	"this is what happens when you learn to code from yahoo answers.",
	"congratulations, you've invented a new way to be wrong.",
	"this code doesn't just have bugs - it's a whole ecosystem.",
	"i'm not saying this is the worst code i've ever seen, but it's definitely in the hall of fame.",
	"this code is so bad, even the linter gave up and went home.",
	"whoever wrote this clearly has a very complicated relationship with best practices.",
	"i've seen spaghetti code before, but this is a whole italian restaurant.",
	"this code works by accident, not by design.",
	"the only thing consistent about this code is its inconsistency.",
	"this is the kind of code that makes seniors reconsider their career choices.",
	"you didn't just miss the mark - you threw the dart backwards.",
	"if code could cry, this would be sobbing uncontrollably.",
	"this looks like the result of a stackoverflow copy-paste marathon.",
	"the only pattern this code follows is chaos.",
	"this code has more red flags than a communist parade.",
	"i'm genuinely impressed by how many anti-patterns you fit in so few lines.",
	"even chatgpt would refuse to take credit for this.",
	"this code is a masterclass in how NOT to do things.",
	"you've managed to violate every SOLID principle in under 10 lines. respect.",
	"this is what happens when you skip the docs and go straight to vibes.",
	"your variable names tell a story, and it's a horror story.",
	"i'd recommend refactoring but honestly just start over.",
	"this code runs on hopes, dreams, and undefined behavior.",
	"the only thing this code handles gracefully is failing.",
	"i've seen cleaner code in obfuscation contests.",
	"this function does so many things it needs its own linkedin profile.",
	"you're not writing code, you're writing future incidents.",
	"this code is technically legal, and that's the nicest thing i can say about it.",
	"actually not bad. i mean it's not great, but i expected worse.",
	"decent structure, but the naming conventions are giving me a migraine.",
	"this is surprisingly readable for something that does absolutely nothing efficiently.",
	"clean code. well done. i almost have nothing mean to say. almost.",
	"solid fundamentals here - just a few rough edges to smooth out.",
	"this code is like a B+ student - good enough but could try harder.",
	"not terrible, but your future self will still hate you for this.",
	"the logic is sound, the execution is... creative.",
	"you clearly know what you're doing, you just chose not to.",
	"this code works and i hate that i can't roast it harder.",
];

const ISSUE_TITLES = {
	critical: [
		"sql injection vulnerability",
		"hardcoded credentials",
		"no error handling whatsoever",
		"using eval() with user input",
		"synchronous http request on main thread",
		"command injection via system call",
		"unvalidated user input passed to query",
		"md5 used for password hashing",
		"race condition in singleton pattern",
		"memory leak - no resource cleanup",
	],
	warning: [
		"using var instead of const/let",
		"imperative loop pattern",
		"god function doing too many things",
		"magic numbers without constants",
		"deeply nested conditionals",
		"callback hell pattern",
		"mutable global state",
		"no input validation",
		"inconsistent naming conventions",
		"type safety bypassed with 'any'",
		"no type annotations",
		"string concatenation for sql",
		"missing null checks",
		"dead code present",
		"overly broad exception handling",
	],
	good: [
		"clear naming conventions",
		"single responsibility principle",
		"proper use of const",
		"good function decomposition",
		"consistent code style",
		"appropriate use of built-in methods",
		"clean import organization",
		"proper error propagation",
		"readable control flow",
		"well-scoped variables",
	],
};

const ISSUE_DESCRIPTIONS: Record<string, string[]> = {
	critical: [
		"user input is directly interpolated into a SQL query string, opening the door to SQL injection attacks. use parameterized queries or an ORM.",
		"passwords and database credentials are hardcoded directly in the source. use environment variables and a secrets manager.",
		"errors are silently swallowed or completely ignored. one unhandled exception and the whole thing crashes with no useful info.",
		"eval() with user-controlled input is essentially giving attackers a shell. never do this.",
		"synchronous HTTP requests block the entire thread. the UI will freeze and users will hate you.",
		"user input flows directly into a system/shell call. this is textbook command injection.",
		"unvalidated input is used directly in database queries. sanitize and validate everything.",
		"md5 is cryptographically broken for password hashing. use bcrypt, scrypt, or argon2.",
		"the singleton pattern has a race condition in multi-threaded contexts. use double-checked locking or static initialization.",
		"resources are opened but never closed. this will leak memory/connections over time and eventually crash.",
	],
	warning: [
		"var is function-scoped and leads to hoisting bugs. use const by default, let when you need reassignment.",
		"manual loops where a simple .map(), .filter(), or .reduce() would be cleaner and more expressive.",
		"this function does too many things. break it into smaller, focused functions with clear responsibilities.",
		"magic numbers scattered throughout the code. extract them into named constants for readability.",
		"deeply nested if/else blocks make this hard to follow. consider early returns or guard clauses.",
		"nested callbacks make the code hard to read and maintain. use async/await or promises.",
		"mutable global state makes the code unpredictable and hard to test. encapsulate state.",
		"user input is accepted without any validation. always validate and sanitize input at the boundary.",
		"mixing camelCase, snake_case, and PascalCase randomly. pick one convention and stick to it.",
		"using 'any' everywhere defeats the purpose of typescript. define proper interfaces.",
		"no type annotations make it impossible to understand what this function expects or returns.",
		"building sql queries with string concatenation is error-prone. use parameterized queries.",
		"accessing properties without null/undefined checks. this will throw at runtime eventually.",
		"there's dead code that's never executed. remove it to reduce confusion.",
		"catching all exceptions with a generic handler hides real bugs. catch specific error types.",
	],
	good: [
		"variable and function names clearly describe their purpose. this makes the code self-documenting.",
		"each function has a clear, single responsibility. this is easy to test and maintain.",
		"using const by default prevents accidental reassignment and signals intent clearly.",
		"complex logic is well-decomposed into smaller helper functions. nice separation of concerns.",
		"consistent formatting and style throughout. looks like someone actually reads the style guide.",
		"good use of built-in array/string methods instead of reinventing the wheel.",
		"imports are organized logically - external deps first, then internal modules.",
		"errors are properly caught and propagated with meaningful context. good job.",
		"the control flow is linear and easy to follow. no spaghetti logic here.",
		"variables are declared close to where they're used and properly scoped.",
	],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function pickVerdict(score: number): (typeof VERDICTS)[number] {
	if (score <= 2.0) return "needs_serious_help";
	if (score <= 4.0) return "rough_around_the_edges";
	if (score <= 6.0) return "not_terrible";
	if (score <= 8.0) return "actually_decent";
	return "solid_code";
}

function pickSeverities(
	score: number,
	count: number,
): (typeof SEVERITIES)[number][] {
	const result: (typeof SEVERITIES)[number][] = [];
	for (let i = 0; i < count; i++) {
		if (score <= 3) {
			result.push(
				faker.helpers.weightedArrayElement([
					{ weight: 5, value: "critical" as const },
					{ weight: 3, value: "warning" as const },
					{ weight: 1, value: "good" as const },
				]),
			);
		} else if (score <= 6) {
			result.push(
				faker.helpers.weightedArrayElement([
					{ weight: 2, value: "critical" as const },
					{ weight: 5, value: "warning" as const },
					{ weight: 2, value: "good" as const },
				]),
			);
		} else {
			result.push(
				faker.helpers.weightedArrayElement([
					{ weight: 1, value: "critical" as const },
					{ weight: 2, value: "warning" as const },
					{ weight: 5, value: "good" as const },
				]),
			);
		}
	}
	return result;
}

function generateDiffLinesForCode(code: string): {
	type: (typeof DIFF_LINE_TYPES)[number];
	content: string;
}[] {
	const codeLines = code.split("\n");
	const diff: { type: (typeof DIFF_LINE_TYPES)[number]; content: string }[] =
		[];

	for (const line of codeLines) {
		const roll = faker.number.float({ min: 0, max: 1 });
		if (roll < 0.3) {
			// This line gets removed and replaced
			diff.push({ type: "removed", content: line });
			diff.push({
				type: "added",
				content: `${line} // improved`,
			});
		} else if (roll < 0.45) {
			// Just removed
			diff.push({ type: "removed", content: line });
		} else if (roll < 0.6) {
			// New line added
			diff.push({ type: "context", content: line });
			diff.push({
				type: "added",
				content: `  // TODO: refactor this`,
			});
		} else {
			// Context line — unchanged
			diff.push({ type: "context", content: line });
		}
	}

	return diff;
}

// ---------------------------------------------------------------------------
// Main seed
// ---------------------------------------------------------------------------

async function seed() {
	console.log("Cleaning existing data...");
	await db.delete(diffLines);
	await db.delete(roastIssues);
	await db.delete(roasts);
	await db.delete(submissions);

	console.log("Seeding 100 submissions + roasts...");

	for (let i = 0; i < 100; i++) {
		const language = faker.helpers.arrayElement(LANGUAGES);
		const codePool = CODE_SNIPPETS[language];
		const code = faker.helpers.arrayElement(codePool);
		const lineCount = code.split("\n").length;
		const roastMode = faker.datatype.boolean({ probability: 0.4 });

		// 1. Insert submission
		const submissionDate = faker.date.recent({ days: 90 });
		const [submission] = await db
			.insert(submissions)
			.values({
				code,
				language,
				lineCount,
				roastMode,
				createdAt: submissionDate,
			})
			.returning({ id: submissions.id });

		// 2. Insert roast
		const score = faker.number.float({ min: 0.5, max: 9.8, fractionDigits: 1 });
		const verdict = pickVerdict(score);

		// Pick a comment that matches the score range
		let comment: string;
		if (score <= 4) {
			comment = faker.helpers.arrayElement(ROAST_COMMENTS.slice(0, 20));
		} else if (score <= 7) {
			comment = faker.helpers.arrayElement(ROAST_COMMENTS.slice(20, 35));
		} else {
			comment = faker.helpers.arrayElement(ROAST_COMMENTS.slice(30, 40));
		}

		const suggestedFix = faker.helpers.maybe(
			() => code.replace(/var /g, "const "),
			{
				probability: 0.8,
			},
		);

		const roastDate = new Date(submissionDate.getTime() + 5000);

		const [roast] = await db
			.insert(roasts)
			.values({
				submissionId: submission.id,
				score: score.toFixed(1),
				roastComment: comment,
				verdict,
				suggestedFix: suggestedFix ?? null,
				createdAt: roastDate,
			})
			.returning({ id: roasts.id });

		// 3. Insert issues (2-4 per roast)
		const issueCount = faker.number.int({ min: 2, max: 4 });
		const severities = pickSeverities(score, issueCount);

		const issueValues = severities.map((severity, idx) => {
			const titlePool = ISSUE_TITLES[severity];
			const descPool = ISSUE_DESCRIPTIONS[severity];
			const titleIdx = faker.number.int({ min: 0, max: titlePool.length - 1 });

			return {
				roastId: roast.id,
				severity,
				title: titlePool[titleIdx],
				description: descPool[titleIdx],
				sortOrder: idx,
			};
		});

		await db.insert(roastIssues).values(issueValues);

		// 4. Insert diff lines
		const diffLinesData = generateDiffLinesForCode(code);
		const diffValues = diffLinesData.map((line, idx) => ({
			roastId: roast.id,
			type: line.type,
			content: line.content,
			lineNumber: idx + 1,
		}));

		if (diffValues.length > 0) {
			await db.insert(diffLines).values(diffValues);
		}

		if ((i + 1) % 25 === 0) {
			console.log(`  ${i + 1}/100 done`);
		}
	}

	// Print summary
	const [counts] = await db
		.select({
			submissions: sql<number>`(SELECT count(*) FROM submissions)`,
			roasts: sql<number>`(SELECT count(*) FROM roasts)`,
			issues: sql<number>`(SELECT count(*) FROM roast_issues)`,
			diffs: sql<number>`(SELECT count(*) FROM diff_lines)`,
		})
		.from(sql`(SELECT 1) as _`);

	console.log("\nSeed complete!");
	console.log(`  submissions: ${counts.submissions}`);
	console.log(`  roasts:      ${counts.roasts}`);
	console.log(`  issues:      ${counts.issues}`);
	console.log(`  diff_lines:  ${counts.diffs}`);

	await client.end();
}

seed().catch((err) => {
	console.error("Seed failed:", err);
	process.exit(1);
});
