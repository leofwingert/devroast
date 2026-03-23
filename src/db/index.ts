import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

let _db: PostgresJsDatabase | undefined;

function createDb(): PostgresJsDatabase {
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
		connect_timeout: 15,
		connection: {
			statement_timeout: 5000,
		},
	});

	return drizzle(client, { casing: "snake_case" });
}

export const db = new Proxy({} as PostgresJsDatabase, {
	get(_target, prop, receiver) {
		if (!_db) _db = createDb();
		return Reflect.get(_db, prop, receiver);
	},
});
