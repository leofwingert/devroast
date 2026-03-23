import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
	throw new Error("Missing DATABASE_URL environment variable.");
}

const isSupabase = connectionString.includes("supabase.com");

// Supabase pooler works best in transaction mode with prepared statements off.
const client = postgres(connectionString, {
	prepare: false,
	ssl: isSupabase ? "require" : undefined,
	max: 1,
	idle_timeout: 20,
	connect_timeout: 5,
	connection: {
		statement_timeout: 5000,
	},
});

export const db = drizzle(client, { casing: "snake_case" });
