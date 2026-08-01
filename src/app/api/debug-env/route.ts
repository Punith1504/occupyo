import { NextResponse } from "next/server";

export async function GET() {
  const envCheck = {
    POSTGRES_URL: process.env.POSTGRES_URL ? `SET (${process.env.POSTGRES_URL.substring(0, 20)}...)` : "MISSING",
    DATABASE_URL: process.env.DATABASE_URL ? `SET (${process.env.DATABASE_URL.substring(0, 20)}...)` : "MISSING",
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY ? `SET (${process.env.CLERK_SECRET_KEY.substring(0, 10)}...)` : "MISSING",
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? `SET (${process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.substring(0, 15)}...)` : "MISSING",
    NODE_ENV: process.env.NODE_ENV,
  };

  // Try connecting to the database
  let dbStatus = "NOT TESTED";
  try {
    const { Pool } = await import("pg");
    const connString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
    if (!connString) {
      dbStatus = "NO CONNECTION STRING AVAILABLE";
    } else {
      const pool = new Pool({ connectionString: connString, connectionTimeoutMillis: 5000 });
      const result = await pool.query("SELECT 1 as test");
      dbStatus = `CONNECTED OK - result: ${JSON.stringify(result.rows)}`;
      await pool.end();
    }
  } catch (err: any) {
    dbStatus = `CONNECTION FAILED: ${err.message}`;
  }

  return NextResponse.json({ envCheck, dbStatus }, { status: 200 });
}
