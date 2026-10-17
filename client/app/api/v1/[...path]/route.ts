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

const STRIP_RESPONSE_HEADERS = new Set([
  "content-encoding",
  "content-length",
  "transfer-encoding",
  "connection",
  "keep-alive",
  "set-cookie",
]);

async function handleProxy(req: NextRequest, path: string[]) {
  const backendBase = process.env.API_INTERNAL_URL || "http://127.0.0.1:5000";
  const search = req.nextUrl.search;
  const targetUrl = `${backendBase}/api/v1/${path.join("/")}${search}`;

  const headers = new Headers(req.headers);
  headers.delete("host");
  headers.delete("connection");
  // Delete accept-encoding so upstream sends uncompressed bytes; Next.js/Vercel handles compression to the browser
  headers.delete("accept-encoding");

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

  const responseBody = await backendRes.arrayBuffer();

  const res = new NextResponse(responseBody, {
    status: backendRes.status,
    statusText: backendRes.statusText,
  });

  // Forward all response headers except hop-by-hop and encoding headers
  backendRes.headers.forEach((val, key) => {
    if (!STRIP_RESPONSE_HEADERS.has(key.toLowerCase())) {
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
