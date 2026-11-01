import { NextResponse } from "next/server";

export function json<T>(data: T, init?: number | ResponseInit) {
  const responseInit = typeof init === "number" ? { status: init } : init;
  return NextResponse.json(data, responseInit);
}

export function errorResponse(message: string, status = 400) {
  return json({ error: message }, status);
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}

export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const appUrl = process.env.APP_URL || "http://localhost:3000";
  if (!origin) return;
  const allowed = new URL(appUrl).origin;
  if (origin !== allowed) {
    throw new Error("Invalid origin");
  }
}
