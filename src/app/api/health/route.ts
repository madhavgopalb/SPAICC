import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status: "ok",
      database: "connected",
      environment: process.env.NODE_ENV ?? "development",
      version: "0.1.0",
      timestamp: new Date().toISOString()
    });
  } catch {
    return NextResponse.json(
      {
        status: "error",
        database: "unavailable",
        environment: process.env.NODE_ENV ?? "development",
        version: "0.1.0",
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    );
  }
}
