import { neon, neonConfig } from "@neondatabase/serverless";

// Ensure fetch is used in browser
neonConfig.fetchConnectionCache = true;

const connectionString = process.env.NEXT_PUBLIC_DATABASE_URL;
if (!connectionString && typeof window !== 'undefined') {
  console.warn("NEXT_PUBLIC_DATABASE_URL is not set. Set it in .env or .env.local");
}

// Only create connection if we have a connection string
export const sql = connectionString ? neon(connectionString) : null as any;

export default sql;


