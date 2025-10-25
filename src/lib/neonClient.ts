import { neon, neonConfig } from "@neondatabase/serverless";

// Ensure fetch is used in browser
neonConfig.fetchConnectionCache = true;

const connectionString = process.env.NEXT_PUBLIC_DATABASE_URL;
if (!connectionString) {
  console.warn("NEXT_PUBLIC_DATABASE_URL is not set. Set it in .env or .env.local");
}

export const sql = neon(connectionString || "");

export default sql;


