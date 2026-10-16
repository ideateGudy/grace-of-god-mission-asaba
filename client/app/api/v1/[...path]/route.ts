import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return handleProxy(req, path);
}

export async function POST(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return handleProxy(req, path);
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return handleProxy(req, path);
}

export async function PUT(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return handleProxy(req, path);
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return handleProxy(req, path);
}

async function handleProxy(req: NextRequest, path: string[]) {
  const backendBase = process.env.API_INTERNAL_URL || "http://127.0.0.1:5000";
  const search = req.nextUrl.search;
  const targetUrl = `${backendBase}/api/v1/${path.join("/")}${search}`;

  const headers = new Headers(req.headers);
  headers.delete("host");

  const body = req.method !== "GET" && req.method !== "HEAD" ? await req.arrayBuffer() : undefined;

  let backendRes: Response;
  try {
    backendRes = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
      redirect: "manual",
    });
  } catch {
    return NextResponse.json(
      { message: "Unable to connect to the backend server. Please try again shortly." },
      { status: 503 }
    );
  }

  const res = new NextResponse(backendRes.body, {
    status: backendRes.status,
    statusText: backendRes.statusText,
  });

  // Forward all response headers except set-cookie (which we forward explicitly below)
  backendRes.headers.forEach((val, key) => {
    if (key.toLowerCase() !== "set-cookie") {
      res.headers.set(key, val);
    }
  });

  // Prevent caching of authenticated or dynamic API responses
  res.headers.set("Cache-Control", "private, no-cache, no-store, must-revalidate");

  // Multi-cookie preservation: extract all Set-Cookie headers individually
  // so intermediate reverse proxies (Vercel edge, CDN) never fold them with commas.
  const setCookies = typeof backendRes.headers.getSetCookie === "function"
    ? backendRes.headers.getSetCookie()
    : [backendRes.headers.get("set-cookie")].filter(Boolean) as string[];

  for (const cookie of setCookies) {
    res.headers.append("Set-Cookie", cookie);
  }

  return res;
}
